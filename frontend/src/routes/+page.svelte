<script>
  import { onMount } from 'svelte';

  let level = $state(0);
  let description = $state("Welcome to Hack this AI challenge. The page is loading...");
  let levelComplete = $state(false);
  let lvlInfo = $state({});

  let trace = $state([]);
  let input = $state("");
  let loading = $state(false);
  let loadingText = $state("");
  let secret = $state("");
  let checkOuput = $state("");

  let showHint = $state(false);
  const cols = 72;

  // const API_URL = "http://192.168.0.33:8000";
  const API_URL = "";

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
    return await response.json();
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
    checkOuput = output.message;
    if (output.success) {
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
    showHint = false;
    checkOuput = "";
    lvlInfo = await get(`/c${level}`);
    description = lvlInfo.description;
  }

  function countCharOccurrences(str, char) {
    const map = new Map();
    for (const c of str) {
      if (c === char) {
        map.set(c, (map.get(c) || 0) + 1);
      }
    }
    return map.get(char) || 0;
  }

  function setupLoadingText() {
    setInterval(async () => {
      if (countCharOccurrences(loadingText, ".") >= 3) loadingText = "Loading";
      else loadingText += ".";
    }, 1000);
  }

  onMount(async () => {
    lvlInfo = await get(`/c${level}`);
    description = lvlInfo.description;
    window.addEventListener('beforeunload', (event) => {
      event.preventDefault();
      event.returnValue = '';
    });
    setupLoadingText();
  });
</script>

<h1>Hack this AI</h1>
<div class="main">
  <div class="trace">
    <pre class="description">{description}</pre>
    {#if lvlInfo.hint && !showHint}
      <button class="show-hint" onclick={() => {showHint = true}}>Show hint</button>
    {:else if lvlInfo.hint && showHint}
      <pre class="hint">{lvlInfo.hint}</pre>
    {/if}
    {#each trace as line}
      <pre class="{line.who}">{line.who}: {line.text}</pre>
    {/each}
    {#if loading}
      <p>{loadingText}</p>
    {/if}
  </div><!-- .trace -->

  <div class="controls">
    <div class="input-area">
      <textarea cols={cols} rows={15} bind:value={input}></textarea>
      <br>
      <button onclick={() => { send() }}>{lvlInfo.action}</button>
    </div>

    <div class="secret">
      <p>Current Level: {level}</p>
      <input bind:value={secret} placeholder="Enter secret here..." />
      <button onclick={() => { check() }}>Check</button>
      {#if checkOuput}
        <pre>{checkOuput}</pre>
      {/if}
      {#if levelComplete && level+1 < 5}
        <button class="next-level" onclick={nextLevel}>Go to level {level+1} →</button>
      {:else if levelComplete && level+1 === 5}
        <div class="winner">
          <p>You won!! No AI is a match for you.</p>
          <p>Contact me if you found anything in here interesting: <a href="mailto:brandon@bxroberts.org">brandon@bxroberts.org</a></p>
        </div>
      {:else}
       <button class="skip-level" onclick={nextLevel}>Skip this level</button>
     {/if}
    </div>
  </div><!-- .controls -->
</div>
<div class="end-info">
  By <a href="https://bxroberts.org">Brandon Roberts</a>
</div>

<style>
  h1 {
    text-align: center;
  }
  pre {
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: sans-serif;
  }

  .main {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
    height: calc(95vh - 120px);
  }

  .trace {
    height: 100%;
    max-width: 700px;
    overflow-y: auto;
  }

  .trace pre {
    padding: 1em;
    border-radius: 1em;
    max-width: 700px;
  }

  .trace pre.llm {
    border: 2px solid grey;
  }

  .trace pre.me {
    border: 2px solid blue;
  }

  .trace pre.description {
    border: 2px solid #ffe400;
  }

  .trace pre.hint {
    border: 2px solid green;
  }

  .controls {
    display: flex;
    flex-flow: column wrap;
    height: 100%;
    width: 38vw;
  }

  .controls .input-area {
    padding: 1em;
  }

  .controls .secret {
    padding: 1em;
  }

  @media (max-width:1300px)  {
    .controls {
      height: auto;
      width: auto;
    }

    .main {
      height: auto;
    }

    .trace {
      height: auto;
      width: auto;
    }
  }

  .next-level {
    border: 1px solid rgb(30, 154, 10);
    background-color: rgba(30, 154, 10, 0.2);
  }

  .show-hint,
  .skip-level {
    border: none;
    background-color: transparent;
    color: grey;
  }

  .end-info {
    text-align: center;
    font-size: 0.9em;
    color: grey;
    padding: 1.2em;
  }
</style>
