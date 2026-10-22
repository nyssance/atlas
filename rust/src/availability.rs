//! 触控板存在性检测(开机「关闭触控板滑动」询问的门槛)。
//!
//! macOS:IOHIDManager 枚举全部 HID 设备,按 usage 对(Digitizer 0x0D / TouchPad 0x05)
//! 判定——内置触控板、Magic Trackpad(蓝牙/USB)、第三方精确触控板统一命中,不依赖
//! Apple 私有 IOKit 类名(AppleMultitouchTrackpad 等随代际漂移)。只读设备元数据、
//! 不 Open manager,不触发「输入监控」TCC 授权。
//! Windows:`GetPointerDevices` 枚举 `POINTER_DEVICE_TYPE_TOUCH_PAD`(精确触控板,
//! Win8.1+ 正规 API)。老式非精确触控板对 OS 就是鼠标,查不出来——检测不到不弹询问,
//! 设置页开关仍可手动调。Linux:桌面环境各异无统一查询,恒 false,同上兜底路径。

#[cfg(target_os = "macos")]
mod macos {
    use std::ffi::c_void;

    const K_HID_PAGE_DIGITIZER: u32 = 0x0D;
    const K_HID_USAGE_DIG_TOUCH_PAD: u32 = 0x05;

    #[link(name = "IOKit", kind = "framework")]
    unsafe extern "C" {
        fn IOHIDManagerCreate(allocator: *const c_void, options: u32) -> *mut c_void;
        fn IOHIDManagerSetDeviceMatching(manager: *mut c_void, matching: *const c_void);
        fn IOHIDManagerCopyDevices(manager: *mut c_void) -> *const c_void;
        fn IOHIDDeviceConformsTo(device: *const c_void, usage_page: u32, usage: u32) -> u8;
    }

    #[link(name = "CoreFoundation", kind = "framework")]
    unsafe extern "C" {
        fn CFSetGetCount(set: *const c_void) -> isize;
        fn CFSetGetValues(set: *const c_void, values: *mut *const c_void);
        fn CFRelease(cf: *const c_void);
    }

    pub fn has_touchpad() -> bool {
        unsafe {
            let manager = IOHIDManagerCreate(std::ptr::null(), 0);
            if manager.is_null() {
                return false;
            }
            // matching = NULL:匹配所有 HID 设备,再按 usage 过滤
            IOHIDManagerSetDeviceMatching(manager, std::ptr::null());
            let devices = IOHIDManagerCopyDevices(manager);
            let found = if devices.is_null() {
                false
            } else {
                let count = CFSetGetCount(devices).max(0) as usize;
                let mut values = vec![std::ptr::null::<c_void>(); count];
                CFSetGetValues(devices, values.as_mut_ptr());
                let hit = values.iter().any(|d| {
                    !d.is_null() && IOHIDDeviceConformsTo(*d, K_HID_PAGE_DIGITIZER, K_HID_USAGE_DIG_TOUCH_PAD) != 0
                });
                CFRelease(devices);
                hit
            };
            CFRelease(manager as *const c_void);
            found
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
