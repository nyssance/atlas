//! 触控板存在性检测(开机「关闭触控板滑动」询问的门槛)。
//!
//! macOS:只读 IORegistry 的 HID usage 元数据(Digitizer 0x0D / TouchPad 0x05)。
//! 不创建 IOHIDManager、不打开输入设备、不请求输入监控权限。
//! Windows:`GetPointerDevices` 枚举 `POINTER_DEVICE_TYPE_TOUCH_PAD`(精确触控板,
//! Win8.1+ 正规 API)。老式非精确触控板对 OS 就是鼠标,查不出来——检测不到不弹询问,
//! 设置页开关仍可手动调。Linux:桌面环境各异无统一查询,恒 false,同上兜底路径。

#[cfg(target_os = "macos")]
mod macos {
    use std::ffi::{c_char, c_void};

    #[link(name = "IOKit", kind = "framework")]
    unsafe extern "C" {
        fn IOServiceMatching(name: *const c_char) -> *const c_void;
        fn IOServiceGetMatchingServices(port: u32, matching: *const c_void, iterator: *mut u32) -> i32;
        fn IOIteratorNext(iterator: u32) -> u32;
        fn IOObjectRelease(object: u32) -> i32;
        fn IORegistryEntryCreateCFProperty(
            entry: u32, key: *const c_void, allocator: *const c_void, options: u32,
        ) -> *const c_void;
    }

    #[link(name = "CoreFoundation", kind = "framework")]
    unsafe extern "C" {
        fn CFStringCreateWithCString(allocator: *const c_void, value: *const c_char, encoding: u32) -> *const c_void;
        fn CFGetTypeID(value: *const c_void) -> usize;
        fn CFArrayGetTypeID() -> usize;
        fn CFArrayGetCount(array: *const c_void) -> isize;
        fn CFArrayGetValueAtIndex(array: *const c_void, index: isize) -> *const c_void;
        fn CFDictionaryGetTypeID() -> usize;
        fn CFDictionaryGetValue(dict: *const c_void, key: *const c_void) -> *const c_void;
        fn CFNumberGetTypeID() -> usize;
        fn CFNumberGetValue(number: *const c_void, kind: isize, value: *mut i64) -> u8;
        fn CFRelease(value: *const c_void);
    }

    struct Object(u32);
    impl Drop for Object {
        fn drop(&mut self) {
            unsafe {
                IOObjectRelease(self.0);
            }
        }
    }
    struct OwnedCf(*const c_void);
    impl Drop for OwnedCf {
        fn drop(&mut self) {
            if !self.0.is_null() {
                unsafe {
                    CFRelease(self.0);
                }
            }
        }
    }
    fn key(value: &std::ffi::CStr) -> OwnedCf {
        OwnedCf(unsafe { CFStringCreateWithCString(std::ptr::null(), value.as_ptr(), 0x08000100) })
    }
    unsafe fn number(value: *const c_void) -> Option<i64> {
        unsafe {
            if value.is_null() || CFGetTypeID(value) != CFNumberGetTypeID() {
                return None;
            }
            let mut result = 0;
            (CFNumberGetValue(value, 4, &mut result) != 0).then_some(result)
        }
    }

    pub fn has_touchpad() -> bool {
        // Read registry metadata only. Never instantiate/open HID devices or a HID manager:
        // those APIs may load user clients and trigger Input Monitoring during startup.
        unsafe {
            let matching = IOServiceMatching(c"IOHIDDevice".as_ptr());
            if matching.is_null() {
                return false;
            }
            let mut iterator = 0;
            // This call consumes the matching dictionary, including on failure.
            if IOServiceGetMatchingServices(0, matching, &mut iterator) != 0 {
                return false;
            }
            let iterator = Object(iterator);
            let pairs_key = key(c"DeviceUsagePairs");
            let page_key = key(c"DeviceUsagePage");
            let usage_key = key(c"DeviceUsage");
            if pairs_key.0.is_null() || page_key.0.is_null() || usage_key.0.is_null() {
                return false;
            }
            loop {
                let service = IOIteratorNext(iterator.0);
                if service == 0 {
                    return false;
                }
                let service = Object(service);
                let pairs = OwnedCf(IORegistryEntryCreateCFProperty(service.0, pairs_key.0, std::ptr::null(), 0));
                if pairs.0.is_null() || CFGetTypeID(pairs.0) != CFArrayGetTypeID() {
                    continue;
                }
                for index in 0..CFArrayGetCount(pairs.0) {
                    let pair = CFArrayGetValueAtIndex(pairs.0, index);
                    if pair.is_null() || CFGetTypeID(pair) != CFDictionaryGetTypeID() {
                        continue;
                    }
                    if number(CFDictionaryGetValue(pair, page_key.0)) == Some(0x0D)
                        && number(CFDictionaryGetValue(pair, usage_key.0)) == Some(0x05)
                    {
                        return true;
                    }
                }
            }
        }
    }
}

#[cfg(target_os = "windows")]
mod windows_impl {
    use windows_sys::Win32::UI::Controls::{POINTER_DEVICE_INFO, POINTER_DEVICE_TYPE_TOUCH_PAD};
    use windows_sys::Win32::UI::Input::Pointer::GetPointerDevices;

    pub fn has_touchpad() -> bool {
        unsafe {
            let mut count: u32 = 0;
            if GetPointerDevices(&mut count, std::ptr::null_mut()) == 0 || count == 0 {
                return false;
            }
            let mut devices: Vec<POINTER_DEVICE_INFO> = vec![POINTER_DEVICE_INFO::default(); count as usize];
            if GetPointerDevices(&mut count, devices.as_mut_ptr()) == 0 {
                return false;
            }
            devices.iter().take(count as usize).any(|d| d.pointerDeviceType == POINTER_DEVICE_TYPE_TOUCH_PAD)
        }
    }
}

/// 本机是否有触控板(检测口径见模块注释)。
pub fn detect() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos::has_touchpad()
    }
    #[cfg(target_os = "windows")]
    {
        windows_impl::has_touchpad()
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        false
    }
}

#[tauri::command]
pub async fn has_trackpad() -> Result<bool, String> {
    tauri::async_runtime::spawn_blocking(detect).await.map_err(|error| error.to_string())
}

#[cfg(all(test, target_os = "macos"))]
mod tests {
    /// 冒烟:枚举不崩、返回布尔。无触控板机器(如 Mac mini)应为 false,
    /// 带触控板机器应为 true——值本身与机器相关,这里只验证调用路径。
    #[test]
    fn has_trackpad_smoke() {
        let v = super::detect();
        println!("has_trackpad = {v}");
    }
}
