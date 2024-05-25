
<script>
  import { onMount } from "svelte";
  import Police from "./Police.svelte";
  import CalMap from "./CalMap.svelte";
  import Crime from "./Mychart.svelte";
  // import { currentPage } from "./store.js"; // import the store

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
    <h1>This is section {index + 1} </h1>
    {#if index == 0}
      <section><CalMap /></section>
      <section><Crime/></section>
    {:else}
      <section>This is section {index + 1}</section>
    {/if}

    <!-- <section>This is section {index + 1}</section> -->

    <!-- add visulation page to each section below -->
    <!-- {#if index == 0}
      <CalMap />
    {/if} -->
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
</style>
