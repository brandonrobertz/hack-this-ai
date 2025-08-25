<script>
  import { onMount } from 'svelte';

  let level = $state(0);
  let description = $state("Welcome to Hack this AI challenge. The page is loading...");
  let levelComplete = $state(false);

  let trace = $state([]);
  let input = $state("");
  let loading = $state(false);
  let secret = $state("");
  let checkOuput = $state("");
  const cols = 72;

  const API_URL = ""

  async function send() {
    const inputText = input;
    trace.push({
      who: "me",
      text: inputText,
    });
    input = "";
    loading = true;
    await ask_llm(inputText);
  };

  async function get(path) {
      const response = await fetch(`${API_URL}${path}`, {
      method: 'GET',
    });
    return await response.text();
  }

  async function post(path, data) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      body: data,
    });
    return await response.text();
  }

  async function ask_llm(inputText) {
    console.log("sending", inputText);
    const output = await post(`/c${level}`, inputText);
    loading = false;
    trace.push({
      who: "llm",
      text: output,
    });
  }

  async function check() {
    const output = await get(`/c${level}?secret=${secret}`);
    checkOuput = output;
    if (output === "Success!") {
      levelComplete = true;
    }
  }

  async function nextLevel() {
    level += 1;
    trace = [];
    input = "";
    secret = "";
    loading = false;
    levelComplete = false;
    checkOuput = "";
    description = await get(`/c${level}`);
  }

  onMount(async () => {
    description = await get(`/c${level}`);
    window.addEventListener('beforeunload', (event) => {
      event.preventDefault();
      event.returnValue = '';
    });
  });
</script>

<h1>Hack this AI</h1>
<div class="main">
  <div class="trace">
    <pre>{description}</pre>
    {#each trace as line}
      <pre class="{line.who}">{line.who}: {line.text}</pre>
    {/each}
    {#if loading}
      <p>Loading...</p>
    {/if}
  </div><!-- .trace -->

  <div class="controls">
    <div>
      <p>Current Level: {level}</p>
      <textarea cols={cols} rows={15} bind:value={input}></textarea>
      <br>
      <button onclick={() => { send() }}>Send</button>
    </div>

    <div class="secret">
      <input bind:value={secret} placeholder="Enter secret here..." />
      <button onclick={() => { check() }}>Check</button>
      {#if checkOuput}
        <pre>{checkOuput}</pre>
      {/if}
      {#if levelComplete && level+1 < 5}
        <button onclick={nextLevel}>Go to level {level+1}</button>
      {:else if levelComplete && level+1 === 5}
        <p>You won!! No AI is a match for you.</p>
        <p>Contact me if you found anything in here interesting: brandon@bxroberts.org</p>
      {:else}
       <button onclick={nextLevel}>Skip this level</button>
     {/if}
    </div>
  </div><!-- .controls -->
</div>

<style>
  h1 {
    text-align: center;
  }
  pre {
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .main {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
    height: calc(100vh - 120px);
  }

  .trace {
    height: 100%;
    max-width: 700px;
    overflow-y: auto;
  }

  .trace pre.llm {
    border: 2px solid grey;
  }

  .trace pre.me {
    border: 2px solid blue;
  }

  .trace pre {
    padding: 1em;
    border-radius: 1em;
  }

  .controls {
    display: flex;
    flex-flow: column wrap;
    height: 100%;
  }

  .controls .secret {
    margin-top: 2em;
  }
</style>
