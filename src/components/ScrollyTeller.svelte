
<script>
  import { onMount } from "svelte";
<<<<<<< HEAD
  import Police from "./Police.svelte";
  import CalMap from "./CalMap.svelte";
  import Crime from "./Mychart.svelte";
  // import { currentPage } from "./store.js"; // import the store
=======
  import CalMap from "./CalMap.svelte"
>>>>>>> 87d05aa5d27a873a7d8525c7b593cc4c0f2da8fb

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

<div class="foreground">
  {#each Array(6) as _, index}
    {#if index == 0}
<<<<<<< HEAD
      <section><CalMap /></section>
      <section><Crime/></section>
=======
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
      
>>>>>>> 87d05aa5d27a873a7d8525c7b593cc4c0f2da8fb
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
<<<<<<< HEAD

    <!-- <section>This is section {index + 1}</section> -->

    <!-- add visulation page to each section below -->
    <!-- {#if index == 0}
      <CalMap />
    {/if} -->
=======
>>>>>>> 87d05aa5d27a873a7d8525c7b593cc4c0f2da8fb
  {/each}
</div>


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

  .big-section {
    margin-bottom: 100px;
  }
</style>
<<<<<<< HEAD
=======

>>>>>>> 87d05aa5d27a873a7d8525c7b593cc4c0f2da8fb
