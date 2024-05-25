
<script>
  import { onMount } from "svelte";
  import Police from "./Police.svelte";
  import CalMap from "./CalMap.svelte"

  let sections, currentPage;

  onMount(() => {
    sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(sections).indexOf(entry.target);
            currentPage = index; // update the store
            console.log(`Current visible section: ${index}`);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.5,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  });
</script>

<!-- <div class="foreground">
  {#each Array(6) as _, index}
    
    {#if index == 0}
      <section class="section-map">
        <h1 class="header">This is section {index + 1} </h1>

        <div class="map-container">
          <CalMap />
        </div>
      </section>
    {:else}
      <section>
        <h1 class="header">This is section {index + 1} </h1>
        This is section {index + 1}</section>
    {/if}
  {/each}
</div> -->
<div class="foreground">
  {#each Array(6) as _, index}
    {#if index == 0}
      <div class="big-section">
        <h1 class="header">This is section {index + 1}</h1>
        <section class="section-map">
          <div class="left">
            <h1 class="header">This is section {index + 1}</h1>
          </div>
          <div class="right">
            <CalMap />
          </div>
        </section>
      </div>
      
    {:else}
      <div class="big-section">
        <h1 class="header">This is section {index + 1}</h1>
        <section class="section-map">
          <div class="left">
            <h1 class="header">This is section {index + 1}</h1>
          </div>
          <div class="right">
            <h1 class="header">This is section {index + 1}</h1>
          </div>
        </section>
      </div>
    {/if}
  {/each}
</div>

<!-- <style global>
  @import 'public/global.css';
  section {
    height: 100vh;
    width: 100%;
    display: grid;
    justify-content: center;
    align-items: center;
  }
  .section-map {
    height: 100vh;
    width: 100%;
    display: grid;
    justify-content: center;
    align-items: center;
  }

  .map-container {
    height: 100vh;
    width: 100%;
    display: grid;
    justify-content: right;
    align-items: right;
  }

</style> -->
<style global>
  @import 'public/global.css';

  section {
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .section-map {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Split the section into two equal halves */
    height: 100vh;
    width: 100%;
  }

  .left, .right {
    display: grid;
    justify-content: center;
    align-items: center;
  }

  .left {
    justify-content: center;
    align-items: center;
  }

  .right {
    justify-content: center;
    align-items: center;
  }

  .header {
    text-align: center;
  }

  .map-container {
    height: 80%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

