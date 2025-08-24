<script>
  let trace = $state([]);
  let input = $state("");
  let secret = $state("");
  let loading = $state(false);
  let level = $state(2);
  let levelComplete = $state(false);
  let checkOuput = $state("");
  const cols = 72;

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

  async function ask_llm(inputText) {
    console.log("sending", inputText);
    const response = await fetch(`http://192.168.0.33:8000/c${level}`, {
      method: 'POST',
      body: inputText,
    });
    const output = await response.text();
    loading = false;
    trace.push({
      who: "llm",
      text: output,
    });
  }

  async function check() {
    const response = await fetch(`http://192.168.0.33:8000/c${level}?secret=${secret}`, {
      method: 'GET',
    });
    const output = await response.text();
    checkOuput = output;
    if (output === "Success!") {
      levelComplete = true;
    }
  }

  function nextLevel() {
    level += 1;
    trace = [];
    input = "";
    secret = "";
    loading = false;
    levelComplete = false;
    checkOuput = "";
  }
</script>

<h1>Hack this AI</h1>
<div class="main">
  <div class="trace">
    <p>Level: {level}</p>
    {#if level == 1}
      <p>Get the code from the helpful LLM.</p>
    {:else if level == 2}
      <p>Same LLM as before. It's got a secret code, but now there's a filter in front of the response.</p>
    {/if}
    {#each trace as line}
      <pre class="{line.who}">{line.who}: {line.text}</pre>
    {/each}
    {#if loading}
      <p>Loading...</p>
    {/if}
  </div><!-- .trace -->

  <div class="controls">
    <div>
      <textarea cols={cols} rows={15} bind:value={input}></textarea>
      <br>
      <button onclick={() => { send() }}>Send</button>
    </div>

    <div>
      <input bind:value={secret} placeholder="Enter secret here..." />
      <button onclick={() => { check() }}>Check</button>
      {#if checkOuput}
        <pre>{checkOuput}</pre>
      {/if}
      {#if levelComplete}
        <button onclick={nextLevel}>Start level {level}</button>
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
    max-height: calc(100vh - 120px);
  }

  .trace {
    max-width: 900px;
    overflow-y: auto;
  }

  .trace pre.llm {
    border: 1px solid blue;
  }

  .trace pre.me {
    border: 1px solid grey;
  }

  .trace pre {
    padding: 1em;
    border-radius: 1em;
  }

  .controls {
    display: flex;
    flex-flow: column wrap;
  }
</style>
