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
    <!-- {#if index == 0}
      <div class="big-section">
        <h1 class="header">California Counties Crime Counts 2013-2022</h1>
        <p class="writeup">
          Welcome to our comprehensive analytical project that investigates the
          relationship between crime rates and police presence across different
          counties in California. Utilizing advanced data analysis techniques,
          we meticulously examine how these variables interact within diverse
          communities. Our project leverages extensive, up-to-date datasets to
          ensure accuracy and relevance in our findings.
        </p>
        <p class="writeup">
          We aim to identify potential correlations that may shed light on the
          effectiveness of law enforcement strategies and their impact on crime
          rates. Our interactive platform features a detailed heat map of each
          county, inviting you to visually compare these metrics across the
          state. By clicking on any county within the map, you can access a bar
          graph that provides a more granular view of the data, including
          specific crime rates.
        </p>
        <p class="writeup"></p>
        <section class="section-map"></section>
      </div>
    {/if} -->

    <!-- 2nd page, cal map with county crime data -->
    {#if index == 0}
      <h1 class="header">California Counties Crime Rates and Counts 2013-2022</h1>

      <p class="writeup">
        Welcome to our comprehensive analytical project that investigates the
        relationship between crime rates and police presence across different
        counties in California. Utilizing advanced data visualization tools, we
        meticulously examine how these variables interact within diverse
        communities. Our project leverages extensive, up-to-date datasets to
        ensure accuracy and relevance in our findings.
      </p>
      <p class="writeup">
        Our objective is to identify possible correlations between the police presence
        in a county and its crime rates. Our interactive platform includes a detailed
        heat map of each county, enabling you to easily visualize and compare crime 
        rate changes across California each year. By clicking on any county on the map,
        you can view a corresponding bar graph showing the counts of various crime categories,
        such as Violent Crimes, Property Crimes, and Arson.
      </p>

      <section class="section-map">
        <div class="right">
          <p class="writeup" style="font-weight: bold;">Counties Crime Rate Heat Map</p>
          <CalMap />
        </div>
        <div class="left">
          <Crime />
        </div>
      </section>
    {/if}

    <!-- 3rd page, police page -->
    {#if index == 2}
      <p class="writeup" style="font-weight: bold;"><br><br><br><br>California Police Population Trends (2013-2022)</p>
      <p class="writeup">
        This interactive visualization presents a decade-long trend (2013-2022)
        of police population across various counties in California. Each line
        represents a different county, showcasing how police population numbers
        have evolved over the years.
      </p>
      <section class="section-map">
        <div class>
          <!-- <h1 class="header"></h1> -->
        </div>
        <div class="right">
          <Police />
        </div>
        
      </section>
      <p class="writeup" style="font-weight: bold;">Conclusion</p>
      <p class="writeup">
        From our visualizations, we observed that although counties such as Stanislaus and Calaveras are two examples of counties 
        that has an increasing police population and a decreasing crime rate, this might not be the case for most California counties. 
        We see counties such as Humboldt's police population remains relatively stagnant, its crime rate still tend to decrease 
        over the years. From these observations, we can conclude that although the population of police officers might have an impact 
        on a county's crime rate, there are likely more underlying factors that affect crime rates that is yet to be looked into, 
        hence we shouldn't generalize our observations.
        <br><br><br><br>
      </p>
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
    padding: 40px; /* Some padding for spacing */
    border-radius: 10px; /* Rounded corners */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
    margin: 30px 0; /* Margin to separate from other sections */
    padding-bottom: 50px;
  }

  .header {
    font-size: 50px; /* Larger font size for header */
    font-weight: bold; /* Bold font for header */
    color: #333; /* Dark grey text color */
    margin-bottom: 10px; /* Space below the header */
  }
  .margin-sides {
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 400px;

  }
  .writeup {
    font-size: 25px; /* Regular font size for paragraph */
    line-height: 1.6; /* Increased line height for readability */
    color: #555; /* Medium grey text color */
    margin-bottom: 20px; /* Space below the paragraph */
    margin-left: 150px;
    margin-right: 150px;
    font-family: 'Times New Roman', serif;

  }


</style>
