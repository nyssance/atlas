<script lang="ts">
  import { atlas } from "../dist/svelte";
  import type { AtlasController } from "../dist/dom";
  let { ready }: { ready: (controller: AtlasController) => void } = $props();
</script>

<div
  use:atlas={{ initialRegion: "workspace", flickMinIndex: 1, onReady: ready }}
  data-atlas
  data-atlas-layout="navigation"
  tabindex="0"
  role="group"
  aria-label="Atlas"
>
  <div data-atlas-track>
    <section data-atlas-region="leading" data-atlas-leading>
      <h2>Leading</h2>
    </section>
    <nav data-atlas-navigation>
      <div data-atlas-navigation-surface>
        <label>Filter<input aria-label="Filter" /></label>
      </div>
    </nav>
    <section data-atlas-region="workspace">
      <h2>Workspace</h2>
      <label>Draft<input aria-label="Draft" /></label>
    </section>
  </div>
</div>
