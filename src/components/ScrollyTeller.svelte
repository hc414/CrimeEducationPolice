<script>
  import { onMount } from "svelte";
  import CalMap from "./CalMap.svelte";
  import Crime from "./Mychart.svelte";
  import Police from "./Police.svelte";

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
    <!-- 1st page, county crime type -->
    {#if index == 0}
      <div class="big-section">
        <h1 class="header">California Counties Crime Counts 2013-2022</h1>
        <p class="writeup">
          This interactive visualization presents a decade-long trend
          (2013-2022) of police population across various counties in
          California. Each line represents a different county, showcasing how
          police population numbers have evolved over the years.
        </p>
        <section class="section-map"></section>
      </div>
    {/if}

    <!-- 2nd page, cal map with county crime data -->
    {#if index == 1}
      <div class="big-section">
        <h1 class="header">California Counties Crime Rate Heat Map</h1>
        <section class="section-map">
          <div class="right">
            <CalMap />
          </div>
          <div class="left">
            <Crime />
          </div>
        </section>
      </div>
    {/if}

    <!-- 3rd page, police page -->
    {#if index == 2}
      <div class="big-section">
        <h1 class="header">California Police Population Trends (2013-2022)</h1>
        <section class="section-map">
          <div class="left">
            <!-- <h1 class="header"></h1> -->
            <p>
              This interactive visualization presents a decade-long trend
              (2013-2022) of police population across various counties in
              California. Each line represents a different county, showcasing
              how police population numbers have evolved over the years.
            </p>
          </div>
          <div class="right">
            <Police />
          </div>
        </section>
      </div>
    {/if}
  {/each}
</div>

<style global>
  @import "public/global.css";

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

  .left,
  .right {
    display: grid;
    justify-content: center;
    align-items: center;
    width: 100%;
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

  .big-section {
    background-color: #ffffff; /* Light grey background */
    padding: 20px; /* Some padding for spacing */
    border-radius: 10px; /* Rounded corners */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
    margin: 20px 0; /* Margin to separate from other sections */
  }

  .header {
    font-size: 50px; /* Larger font size for header */
    font-weight: bold; /* Bold font for header */
    color: #333; /* Dark grey text color */
    margin-bottom: 10px; /* Space below the header */
  }

  .writeup {
    font-size: 30px; /* Regular font size for paragraph */
    line-height: 1.6; /* Increased line height for readability */
    color: #555; /* Medium grey text color */
    margin-bottom: 20px; /* Space below the paragraph */
  }
</style>
