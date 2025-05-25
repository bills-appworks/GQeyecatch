<!--
  @fileoverview GQuuuuuuXアイキャッチ風アニメ画像ジェネレータ
  @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
  @copyright bills-appworks 2025
  @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
-->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { replaceState } from "$app/navigation";
  import html2canvas from "html2canvas";
  import GIF from "gif.js";

  // type definitions

  type AppStatus = {
    text: string,
    font: string,
    size: number,
    weight: number,
    spacing: number,
    brightness: number,
    prefix: number,
    suffix: number,
    suffix_align: number,
    delay: number,
  };

  type ValidationBasic = {
    min: number | undefined,
    max: number | undefined,
    default: number,
  }
  type Validation = {
    text: {min: number, max: number, default: string},
    font: {list: string[], default: string},
    size: ValidationBasic,
    weight: ValidationBasic,
    spacing: ValidationBasic,
    brightness: ValidationBasic,
    prefix: ValidationBasic,
    suffix: ValidationBasic,
    suffix_align: ValidationBasic,
    delay: ValidationBasic,
    replay_url: {min: number, max: number, default: string},
  }

  type DivideNumbers = {
    prefix: number;
    middle: number;
    suffix: number;
  };

  type DivideStrings = {
    prefix: string;
    middle: string;
    suffix: string;
  }

  // value definitions

  const candidate_fonts: string[] = [
    "Saira Stencil One",
    "Noto Sans JP",
    "Noto Serif JP",
    "DM Serif Display",
    "Michroma",
    "Dela Gothic One",
  ];

  const valid_values: Validation = {
    text: {min: 0, max: 256, default: "GQuuuuuuX"},
    font: {list: candidate_fonts, default: candidate_fonts[0]},
    size: {min: 1, max: 256, default: 64},
    weight: {min: 100, max: 900, default: 400},
    spacing: {min: -10, max: 10, default: -1},
    brightness: {min: 0, max: 100, default: 65},
    prefix: {min: 0, max: undefined, default: 2},
    suffix: {min: 0, max: undefined, default: 1},
    suffix_align: {min: -100, max: 0, default: -11},
    delay: {min: 50, max: 1000, default: 50},
    replay_url: {min: 0, max: 65536, default: ""},
  };

  const download_filename_default: string = 'GQuuuuuuX-eye-catch.gif';

  let app_status: AppStatus = {
    text: valid_values.text.default,
    font: valid_values.font.default,
    size: valid_values.size.default,
    weight: valid_values.weight.default,
    spacing: valid_values.spacing.default,
    brightness: valid_values.brightness.default,
    prefix: valid_values.prefix.default,
    suffix: valid_values.suffix.default,
    suffix_align: valid_values.suffix_align.default,
    delay: valid_values.delay.default,
  };

  let query_parameter: Record<string, string> = {};

  let timer_id: number | undefined = undefined;

  let GIF_encoder: GIF;

  let evacuated_qux_opacity: string;

  let evacuated_gif_object_fit: string;

  // bindings
  let property_disabled: boolean = false;
  let property_text_value: string = app_status.text;
  let property_font_value: string = app_status.font;
  let property_size_value: string = app_status.size.toString();
  let property_weight_value: string = app_status.weight.toString();
  let property_spacing_value: string = app_status.spacing.toString();
  let property_brightness_value: string = app_status.brightness.toString();
  let property_prefix_value: string = app_status.prefix.toString();
  $: property_prefix_max = property_text_value.length.toString();
  let property_suffix_value: string = app_status.suffix.toString();
  $: property_suffix_max = property_text_value.length.toString();
  let property_suffix_align_value: string = app_status.suffix_align.toString();
  let property_delay_value: string = app_status.delay.toString();
  let preview_button_disabled: boolean = false;
  let reset_button_disabled: boolean = false;
  let qux: HTMLDivElement;
  let qux_prefix: HTMLSpanElement;
  let qux_middle: HTMLSpanElement;
  let qux_suffix: HTMLSpanElement;
  let record_button_disabled: boolean = true;
  let gif: HTMLImageElement;
  let download_button_disabled: boolean = true;
  let copied_balloon_fadeout = '';
  let replay_url_value: string;

  // utility functions

  function getValidRange(value: number, validator: ValidationBasic): number {
    if (value >= (validator.min as number) && value <= (validator.max as number)) {
      return value;
    } else {
      return validator.default;
    }
  }

  function getText(): string {
    return property_text_value.substring(0, valid_values.text.max);
  }

  function getFont(): string {
    if (valid_values.font.list.includes(property_font_value)) {
      return property_font_value;
    } else {
      return valid_values.font.default;
    }
  }

  function getSize(): number {
    return getValidRange(parseInt(property_size_value), valid_values.size);
  }

  function getWeight(): number {
    return getValidRange(parseInt(property_weight_value), valid_values.weight);
  }

  function getSpacing(): number {
    return getValidRange(parseInt(property_spacing_value), valid_values.spacing);
  }

  function getBrightness(): number {
    return getValidRange(parseInt(property_brightness_value), valid_values.brightness);
  }

  function getPrefix(): number {
    const specified_value: number = parseInt(property_prefix_value);
    if (specified_value >= (valid_values.prefix.min as number) && specified_value <= property_text_value.length) {
      return specified_value;
    } else {
      return valid_values.prefix.default;
    }
  }

  function getSuffix(): number {
    const specified_value: number = parseInt(property_suffix_value);
    if (specified_value >= (valid_values.suffix.min as number) && specified_value <= property_text_value.length) {
      return specified_value;
    } else {
      return valid_values.suffix.default;
    }
  }

  function getSuffixAlign(): number {
    return getValidRange(parseInt(property_suffix_align_value), valid_values.suffix_align);
  }

  function getDelay(): number {
    return getValidRange(parseInt(property_delay_value), valid_values.delay);
  }

  function getReplayURL(): string {
    return replay_url_value.substring(0, valid_values.replay_url.max);
  }

  function getSizeStyle(): string {
    return getSize() + 'pt';
  }

  function getWeightStyle(): string {
    return getWeight().toString();
  }

  function getSpacingStyle(): string {
    return getSpacing() * 0.05 + 'em';
  }

  function getSuffixAlignStyle(): string {
    return getSuffixAlign() + '%';
  }

  function adjustRenderingArea(): void {
    // テキストの長さに応じて幅を調整
    const measure_element = document.createElement('div');
    measure_element.style.position = 'absolute';
    measure_element.style.top = '-9999px';
    measure_element.style.left = '-9999px';
    measure_element.style.fontStyle = 'italic';
    measure_element.style.fontFamily = getFont();
    measure_element.style.fontSize = getSizeStyle();
    measure_element.style.fontWeight = getWeightStyle();
    measure_element.style.letterSpacing = getSpacingStyle();
    // やや右側が大きいが、これよりずらすと選択フォントによっては右側はみ出す場合がある
    measure_element.style.paddingLeft = '0.2em'; // qux.style.paddingLeftの値を設定してもずれるためCSSと同じリテラルを設定
    measure_element.style.paddingRight = '0.4em'; // qux.style.paddingRightの値を設定してもずれるためCSSと同じリテラルを設定
    measure_element.textContent = getText();
    document.body.appendChild(measure_element);
    const measure_width: number = measure_element.clientWidth;
    document.body.removeChild(measure_element);

    qux.style.width = measure_width + 'px';
  }

  function adjustGIFArea(): void {
    gif.width = qux.offsetWidth;
    gif.height = qux.offsetHeight;
  }

  function buildURL(): string {
    const before_query: string = location.href.split('?')[0];
    const params_expand: string = new URLSearchParams(query_parameter).toString();
    if (params_expand.length > 0) {
      return before_query + '?' + params_expand;
    } else {
      return before_query;
    }
  }

  function displayReplayURL(): void {
    replay_url_value = buildURL();
  }

  function replaceBrowserURL(): void {
    replaceState(buildURL(), '');
  }

  function calcDivideNumbers(text: string, request_prefix: number, request_suffix: number): DivideNumbers {
    let calc_prefix: number;
    if (text.length >= request_prefix) {
      calc_prefix = request_prefix;
    } else {
      calc_prefix = text.length;
    }
    let calc_suffix: number;
    if (text.length >= calc_prefix + request_suffix) {
      calc_suffix = request_suffix;
    } else {
      calc_suffix = text.length - calc_prefix;
    }
    let calc_middle: number;
    if (text.length >= calc_prefix + calc_suffix) {
      calc_middle = text.length - calc_prefix - calc_suffix;
    } else {
      calc_middle = 0;
    }

    return {
      prefix: calc_prefix,
      suffix: calc_suffix,
      middle: calc_middle,
    };
  }

  function extractDivideText(text: string, request_prefix: number, request_suffix: number): DivideStrings {
    const divide_numbers: DivideNumbers = calcDivideNumbers(text, request_prefix, request_suffix);
    const prefix: string = text.substring(0, divide_numbers.prefix);
    const middle: string = text.substring(divide_numbers.prefix, divide_numbers.prefix + divide_numbers.middle);
    const suffix: string = text.substring(divide_numbers.prefix + divide_numbers.middle);

    return {
      prefix: prefix,
      middle: middle,
      suffix: suffix,
    }
  }

  function renderingPreview(): void {
    qux.style.fontFamily = getFont();
    qux.style.fontSize = getSizeStyle();
    qux.style.fontWeight = getWeightStyle();
    qux.style.letterSpacing = getSpacingStyle();
    qux_suffix.style.verticalAlign = getSuffixAlignStyle();
    qux.style.opacity = (getBrightness() / 100).toString();
    const divide_text: DivideStrings = extractDivideText(getText(), getPrefix(), getSuffix());
    qux_prefix.textContent = divide_text.prefix;
    qux_middle.textContent = divide_text.middle;
    qux_suffix.textContent = divide_text.suffix;
  }

  function mediateURLSearchParams(url_search_params: URLSearchParams, key: string): void {
    const mediator: string | null = url_search_params.get(key);
    if (mediator) {
      query_parameter[key] = mediator;
    }
  }

  function parseQueryParameter(): void {
    const url_query: string = location.search;
    if (url_query && url_query.length > 1) {
      const url_search_params: URLSearchParams = new URLSearchParams(url_query);
      mediateURLSearchParams(url_search_params, 'text');
      mediateURLSearchParams(url_search_params, 'font');
      mediateURLSearchParams(url_search_params, 'size');
      mediateURLSearchParams(url_search_params, 'weight');
      mediateURLSearchParams(url_search_params, 'spacing');
      mediateURLSearchParams(url_search_params, 'brightness');
      mediateURLSearchParams(url_search_params, 'prefix');
      mediateURLSearchParams(url_search_params, 'suffix');
      mediateURLSearchParams(url_search_params, 'suffix_align');
      mediateURLSearchParams(url_search_params, 'delay');
    }
  }

  function reflectQueryParameter(): void {
    if (query_parameter.text) {
      property_text_value = query_parameter.text;
    }
    if (query_parameter.font) {
      property_font_value = query_parameter.font;
    }
    if (query_parameter.size) {
      property_size_value = query_parameter.size;
    }
    if (query_parameter.weight) {
      property_weight_value = query_parameter.weight;
    }
    if (query_parameter.spacing) {
      property_spacing_value = query_parameter.spacing;
    }
    if (query_parameter.brightness) {
      property_brightness_value = query_parameter.brightness;
    }
    if (query_parameter.prefix) {
      property_prefix_value = query_parameter.prefix;
    }
    if (query_parameter.suffix) {
      property_suffix_value = query_parameter.suffix;
    }
    if (query_parameter.suffix_align) {
      property_suffix_align_value = query_parameter.suffix_align;
    }
    if (query_parameter.delay) {
      property_delay_value = query_parameter.delay;
    }
  }

  function handleInputChanges(): void {
    adjustRenderingArea();
    renderingPreview();
    adjustGIFArea();
    displayReplayURL();
    replaceBrowserURL();
    record_button_disabled = getText().length == 0;
    gif.style.visibility = 'hidden';
    download_button_disabled = true;
  }

  function encodeFrame(): void {
    html2canvas(qux, {backgroundColor: 'transparent'}).then((converted_canvas) => {
      // html2canvasが透過設定div文字と画像との合成で白点が浮くのを回避するためキャンセルした透過を合成用canvasで適用
      const composite_canvas: HTMLCanvasElement = document.createElement('canvas');
      composite_canvas.style.width = converted_canvas.width + 'px';
      composite_canvas.style.height = converted_canvas.height + 'px';
      composite_canvas.width = converted_canvas.width;
      composite_canvas.height = converted_canvas.height;
      const composite_context: CanvasRenderingContext2D = composite_canvas.getContext('2d') as CanvasRenderingContext2D;
      composite_context.globalAlpha = getBrightness() / 100;
      composite_context.fillStyle = composite_context.createPattern(converted_canvas, 'no-repeat') as CanvasPattern;
      composite_context.beginPath();
      composite_context.rect(0, 0, composite_canvas.width, composite_canvas.height);
      composite_context.fill();
      composite_context.closePath();
      
      GIF_encoder.addFrame(composite_canvas, {delay: getDelay()});
    });
  }

  function animate(step: number, is_record: boolean): void {
    if (step === 0) {
      if (is_record) {
        // html2canvasが透過設定div文字と画像との合成で白点が浮くのを回避するため一時的に透過をキャンセル
        evacuated_qux_opacity = qux.style.opacity;
        qux.style.opacity = '1';
      }

      const divide_text: DivideStrings = extractDivideText(getText(), getPrefix(), getSuffix());
      qux_prefix.textContent = divide_text.prefix;
      qux_middle.textContent = '';
      qux_suffix.textContent = divide_text.suffix;
      if (is_record) {
        encodeFrame();
      }
    } else if (getText().length - getPrefix() - getSuffix() - step >= 0) {
      const divide_numbers: DivideNumbers = calcDivideNumbers(getText(), getPrefix(), getSuffix());
      qux_middle.textContent = getText().substring(divide_numbers.prefix, divide_numbers.prefix + step);
      if (is_record) {
        encodeFrame();
      }
    } else {
      window.clearTimeout(timer_id);
      timer_id = undefined;
      if (is_record) {
        GIF_encoder.render();
        // html2canvasが透過設定div文字と画像との合成で白点が浮くのを回避するため一時的に透過をキャンセルのリストア
        qux.style.opacity = evacuated_qux_opacity;
      }
      return;
    }

    let delay: number = getDelay();
    if (is_record) {
      // GIFエンコード時は短いとエンコーディング中に次のタイマ実行が行われるため大きめにする
      delay = 200;
    }
    timer_id = window.setTimeout(animate, delay, step + 1, is_record);
  }

  // handler functions

  // async await tick()でDOM描画完了してから実行しreplaceState()でエラーが出るのを防止
  onMount(async () => {
    await tick();
    parseQueryParameter();
    reflectQueryParameter();
    handleInputChanges();
  });

  function onInputText() {
    query_parameter.text = getText();
    handleInputChanges();
  }

  function onChangeFont() {
    query_parameter.font = getFont();
    handleInputChanges();
  }

  function onInputSize() {
    query_parameter.size = getSize().toString();
    handleInputChanges();
  }

  function onInputWeight() {
    query_parameter.weight = getWeight().toString();
    handleInputChanges();
  }

  function onInputSpacing() {
    query_parameter.spacing = getSpacing().toString();
    handleInputChanges();
  }

  function onInputBrightness() {
    query_parameter.brightness = getBrightness().toString();
    handleInputChanges();
  }

  function onInputPrefix() {
    query_parameter.prefix = getPrefix().toString();
    handleInputChanges();
  }

  function onInputSuffix() {
    query_parameter.suffix = getSuffix().toString();
    handleInputChanges();
  }

  function onInputSuffixAlign() {
    query_parameter.suffix_align = getSuffixAlign().toString();
    handleInputChanges();
  }

  function onInputDelay() {
    query_parameter.delay = getDelay().toString();
    handleInputChanges();
  }

  function onClickPreview() {
    if (!preview_button_disabled) {
      animate(0, false);
    }
  }

  function onClickReset() {
    property_text_value = valid_values.text.default;
    property_font_value = valid_values.font.default;
    property_size_value = valid_values.size.default.toString();
    property_weight_value = valid_values.weight.default.toString();
    property_spacing_value = valid_values.spacing.default.toString();
    property_brightness_value = valid_values.brightness.default.toString();
    property_prefix_value = valid_values.prefix.default.toString();
    property_suffix_value = valid_values.suffix.default.toString();
    property_suffix_align_value = valid_values.suffix_align.toString();
    property_delay_value = valid_values.delay.default.toString();
    query_parameter = {};
    handleInputChanges();
  }

  function onClickRecord() {
    GIF_encoder = new GIF({
      repeat: -1,
      quality: 1,
    });
    GIF_encoder.on('finished', (blob: Blob) => {
      // 最初に最終フレームが一瞬表示される事象の緩和（完全抑止ではない）
      const object_url = URL.createObjectURL(blob);
      gif.src = '';
      gif.style.visibility = 'hidden';
      setTimeout(() => {
        gif.src = object_url;
        requestAnimationFrame(() => {
          gif.style.visibility = 'visible';
          download_button_disabled = false;
          gif.style.objectFit = evacuated_gif_object_fit;
          document.body.style.cursor = '';
          record_button_disabled = false;
          reset_button_disabled = false;
          preview_button_disabled = false;
          property_disabled = false;
        });
      }, 100);
    });
    property_disabled = true;
    preview_button_disabled = true;
    reset_button_disabled = true;
    record_button_disabled = true;
    document.body.style.cursor = 'wait';
    evacuated_gif_object_fit = gif.style.objectFit;
    gif.style.objectFit = 'none';
    gif.src = 'processing.gif';
    gif.onload = () => {
      gif.style.visibility = 'visible';
    };

    animate(0, true);
  }

  function onClickGIF() {
    if (!record_button_disabled) {
      const evacuated_image_src = gif.src;
      gif.src = '';
      gif.src = evacuated_image_src;
    }
  }

  function onClickDownload() {
    const link_anchor: HTMLAnchorElement = document.createElement("a");
    link_anchor.href = gif.src;
    link_anchor.download = download_filename_default;
    link_anchor.click();
  }

  function onClickCopyReplayURL() {
    navigator.clipboard.writeText(getReplayURL());
    copied_balloon_fadeout = 'copied_balloon_fadeout';
    setTimeout(() => {
      copied_balloon_fadeout = '';
    }, 3000);
  }
</script>
<style>
  @import 'style.css';
</style>
<header>
  <h1 id="title">GQuuuuuuXアイキャッチ風アニメ画像ジェネレータ</h1>
</header>
<main>
  <div class="properties">
    <div class="property-item">
      <label for="property-text" class="description property-label">テキスト</label>
      <input id="property-text" bind:value={property_text_value} on:input={onInputText} type="text" size="27" disabled={property_disabled} />
    </div>
    <div class="property-item" role="listitem">
      <label for="property-font" class="description property-label">フォント</label>
      <select name="property-font" id="property-font" bind:value={property_font_value} on:change={onChangeFont} disabled={property_disabled}>
        {#each candidate_fonts as option_font}
          <option value="{option_font}">{option_font}</option>
        {/each}
      </select>
    </div>
    <div class="property-item" role="listitem">
      <label for="property-size" class="description property-label">サイズ</label>
      <input id="property-size-range" bind:value={property_size_value} on:input={onInputSize} type="range" min="1" max="256" disabled={property_disabled} />
      <input id="property-size-number" bind:value={property_size_value} on:input={onInputSize} type="number" min="1" max="256" disabled={property_disabled} />
    </div>
    <div class="property-item" role="listitem">
      <label for="property-weight" class="description property-label">太さ</label>
      <input id="property-weight-range" bind:value={property_weight_value} on:input={onInputWeight} type="range" min="100" max="900" disabled={property_disabled} />
      <input id="property-weight-number" bind:value={property_weight_value} on:input={onInputWeight} type="number" min="100" max="900" disabled={property_disabled} />
    </div>
    <div class="property-item" role="listitem">
      <label for="property-spacing" class="description property-label">文字間隔</label>
      <input id="property-spacing-range" bind:value={property_spacing_value} on:input={onInputSpacing} type="range" min="-10" max="10" disabled={property_disabled} />
      <input id="property-spacing-number" bind:value={property_spacing_value} on:input={onInputSpacing} type="number" min="-10" max="10" disabled={property_disabled} />
    </div>
    <div class="property-item" role="listitem">
      <label for="property-brightness" class="description property-label">輝度</label>
      <input id="property-brightness-range" bind:value={property_brightness_value} on:input={onInputBrightness} type="range" min="0" max="100" disabled={property_disabled} />
      <input id="property-brightness-number" bind:value={property_brightness_value} on:input={onInputBrightness} type="number" min="0" max="100" disabled={property_disabled} />
    </div>
    <div class="property-item" role="listitem">
      <label for="property-prefix" class="description property-label">先頭固定数</label>
      <input id="property-prefix-range" bind:value={property_prefix_value} on:input={onInputPrefix} type="range" min="0" max={property_prefix_max} disabled={property_disabled} />
      <input id="property-prefix-number" bind:value={property_prefix_value} on:input={onInputPrefix} type="number" min="0" max={property_prefix_max} disabled={property_disabled} />
    </div>
    <div class="property-item" role="listitem">
      <label for="property-suffix" class="description property-label">末尾固定数</label>
      <input id="property-suffix-range" bind:value={property_suffix_value} on:input={onInputSuffix} type="range" min="0" max={property_suffix_max} disabled={property_disabled} />
      <input id="property-suffix-number" bind:value={property_suffix_value} on:input={onInputSuffix} type="number" min="0" max={property_suffix_max} disabled={property_disabled} />
    </div>
    <div class="property-item" role="listitem">
      <label for="property-suffix-align" class="description property-label">末尾字下げ</label>
      <input id="property-suffix-align-range" bind:value={property_suffix_align_value} on:input={onInputSuffixAlign} type="range" min="-100" max="0" disabled={property_disabled} />
      <input id="property-suffix-align-number" bind:value={property_suffix_align_value} on:input={onInputSuffixAlign} type="number" min="-100" max="0" disabled={property_disabled} />
    </div>
    <div class="property-item" role="listitem">
      <label for="property-delay" class="description property-label">時間間隔</label>
      <input id="property-delay-range" bind:value={property_delay_value} on:input={onInputDelay} type="range" min="50" max="1000" disabled={property_disabled} />
      <input id="property-delay-number" bind:value={property_delay_value} on:input={onInputDelay} type="number" min="50" max="1000" disabled={property_disabled} />
    </div>
  </div>
  <div class="functions">
    <button id="preview-button" on:click={onClickPreview} disabled={preview_button_disabled} class="displayed-button"><i class="fa-solid fa-play"></i> プレビュー再生</button>
    <button id="reset-button" on:click={onClickReset} disabled={reset_button_disabled} class="displayed-button"><i class="fa-solid fa-trash"></i> リセット</button>
  </div>
  <div class="section-title">プレビュー（タップで再アニメーション）</div>
  <div>
    <button id="preview-area-button" on:click={onClickPreview} class="pseudo-button" aria-label="プレビュー">
      <div id="qux" bind:this={qux}><span id="qux-prefix" bind:this={qux_prefix}></span><span id="qux-middle" bind:this={qux_middle}></span><span id="qux-suffix" bind:this={qux_suffix}></span></div>
    </button>
  </div>
  <div>
    <button id="record-button" on:click={onClickRecord} disabled={record_button_disabled} class="displayed-button"><i class="fa-solid fa-circle"></i> GIF録画</button>
  </div>
  <div class="section-title">作成GIF（タップで再アニメーション）</div>
  <div>
    <button id="gif-area-button" on:click={onClickGIF} class="pseudo-button" aria-label="GIF">
      <img id="gif" bind:this={gif} alt="GIF" src="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA==" />
      <span id="gif-click-layer"></span>
    </button>
  </div>
  <div>
    <button id="download-button" on:click={onClickDownload} disabled={download_button_disabled} class="displayed-button"><i class="fa-solid fa-download"></i> GIFダウンロード</button>
  </div>
  <div>
    <div id="replay-url-header">
      <div class="description">
        <span>再現URL</span>
      </div>
      <button id="copy-replay-url" on:click={onClickCopyReplayURL} class="displayed-button">
        <span>コピー</span>
      </button>
      <div id="copied-balloon" class="copied_balloon" class:copied_balloon_fadeout>
        <span>コピーしました</span>
      </div>
    </div>
    <div>
      <textarea id="replay-url" bind:value={replay_url_value} readonly></textarea>
    </div>
  </div>
</main>
<footer>
  <small id="author">
    <span>
      <span>アプリ作成者：びるず</span>
      <span class="link">(<a href="https://bsky.app/profile/bills-appworks.blue" target="_blank">Bluesky <i class="fa-brands fa-bluesky"></i> @bills-appworks.blue</a>)</span>
    </span>
  </small>
  <small id="copyright">
    <div>Application's copyright &copy; 2025 bills-appworks</div>
    <div>(Except &ldquo;GQuuuuuuX&rdquo; and those product expression)</div>
  </small>
  <small id="privacy-policy">
    <div>
      <span class="link"><a href="/privacy_policy.html" target="_blank">プライバシーポリシー</a></span>
    </div>
  </small>
</footer>
