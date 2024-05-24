<<<<<<< Updated upstream
=======
<script>
  import Scroller from "@sveltejs/svelte-scroller";
  import MyChart from "./MyChart.svelte";
>>>>>>> Stashed changes

<script>
  import { onMount } from "svelte";
  import Police from "./Police.svelte";
  import CalMap from "./CalMap.svelte"
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
<<<<<<< Updated upstream

<div class="foreground">
  {#each Array(6) as _, index}
    <h1>This is section {index + 1} </h1>
    {#if index == 0}
      <section><CalMap /></section>
    {:else}
      <section>This is section {index + 1}</section>
    {/if}
    <!-- <section>This is section {index + 1}</section> -->
=======
<div>
  <MyChart />
</div>
<style>
  .background {
    width: 100%;
    height: 100vh;
    position: relative;
    outline: green solid 3px;
  }
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
=======
<Scroller
  top={0.0}
  bottom={1}
  threshold={0.5}
  bind:count
  bind:index
  bind:offset
  bind:progress
>
  <div class="background" slot="background">
    <div class="progress-bars">
      <p>current section: <strong>{index + 1}/{count}</strong></p>
      <progress value={count ? (index + 1) / count : 0} />

      <p>offset in current section</p>
      <progress value={offset || 0} />

      <p>total progress</p>
      <progress value={progress || 0} />
    </div>
  </div>

  <div class="foreground" slot="foreground">
    <section>This is the first section.</section>
    <section>This is the second section.</section>
    <section>This is the third section.</section>
    <section>This is the 4 section.</section>
    <section>This is the 5 section.</section>
    <section>This is the 6 section.</section>
  </div>

</Scroller>
>>>>>>> Stashed changes
