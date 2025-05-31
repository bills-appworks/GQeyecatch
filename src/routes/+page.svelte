<!--
  @fileoverview GQuuuuuuXアイキャッチ風アニメ画像ジェネレータ
  @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
  @copyright bills-appworks 2025
  @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
-->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { replaceState } from "$app/navigation";
  import GIF from "gif.js";
  import { base } from "$app/paths";
  import { loadFont, isFontLoaded } from '$lib/fontManager';

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

  let is_safari: boolean | undefined = undefined;

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
    suffix_align: {min: -100, max: 0, default: -22},
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

  let timer_id_animate: number | undefined = undefined;

  let timer_id_opening1: number | undefined = undefined;

  let timer_id_opening2: number | undefined = undefined;

  let GIF_encoder: GIF;

  let evacuated_gif_object_fit: string;

  // bindings

  let now_loading: HTMLDivElement;
  let omega_psycommu: HTMLDivElement;
  let omega_psycommu_status: HTMLDivElement;
  let omega_psycommu_status_text: string = 'INOPERATIVE';
  let omega_psycommu_link_text: string = '---';
  let omega_psycommu_sync_text: string = '---';
  let operation: HTMLDivElement;
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
  let preview_canvas: HTMLCanvasElement;
  let composite_canvas: HTMLCanvasElement;
  let texture_image: HTMLImageElement;
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
    return `${getSize()}pt`;
  }

  function getWeightStyle(): string {
    return getWeight().toString();
  }

  function getSpacingStyle(): string {
    return `${getSpacing() * 0.05}em`;
  }

  function adjustCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width;
    canvas.height = height;
  }

  function setRenderingStyle(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.letterSpacing = getSpacingStyle();
    ctx.font = `italic ${getWeightStyle()} ${getSizeStyle()} ${getFont()}`;
  }

  function calcAdjustSize(base_width: number, base_height: number): {width: number, height: number} {
    const adjust_width = base_width / getText().length * 2;
    const adjust_height = base_height * 0.5;
    return {width: adjust_width, height: adjust_height};
  }

  function getAlignFactor(base_height: number): number {
    return base_height * (-getSuffixAlign() / 100);
  }

  function measureText(ctx: CanvasRenderingContext2D, text: string): {width: number, height: number} {
    const metrics_full: TextMetrics = ctx.measureText(getText());
    const measure_width: number = metrics_full.width;
    const measure_height: number = metrics_full.actualBoundingBoxAscent + metrics_full.actualBoundingBoxDescent;
    return {
      width: measure_width,
      height: measure_height,
    };
  }

  function adjustRenderingArea(): void {
    // テキストの長さに応じて幅を調整
    const measure_element: HTMLCanvasElement = document.createElement('canvas');
    const measure_ctx: CanvasRenderingContext2D = measure_element.getContext('2d') as CanvasRenderingContext2D;
    setRenderingStyle(measure_ctx);
    const {width: measure_width, height: measure_height} = measureText(measure_ctx, getText());

    const {width: adjust_width, height: adjust_height} = calcAdjustSize(measure_width, measure_height);
    const adjusted_width = parseInt((measure_width + adjust_width).toFixed());
    const adjusted_height = parseInt((measure_height + adjust_height + getAlignFactor(measure_height)).toFixed());
    adjustCanvas(preview_canvas, adjusted_width, adjusted_height);
    adjustCanvas(composite_canvas, adjusted_width, adjusted_height);
  }

  function adjustGIFArea(): void {
    gif.width = preview_canvas.offsetWidth;
    gif.height = preview_canvas.offsetHeight;
  }

  function buildURL(): string {
    const before_query: string = location.href.split('?')[0];
    const params_expand: string = new URLSearchParams(query_parameter).toString();
    if (params_expand.length > 0) {
      return `${before_query}?${params_expand}`;
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
      if (calc_suffix < 0) {
        calc_suffix = 0;
      }
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

  function extractDivideText(text: string, request_prefix: number, request_suffix: number, step: number | undefined = undefined): DivideStrings {
    const divide_numbers: DivideNumbers = calcDivideNumbers(text, request_prefix, request_suffix);
    let middle_length = divide_numbers.middle;
    if (step !== undefined) {
      middle_length = step;
    }
    const prefix: string = text.substring(0, divide_numbers.prefix);
    const middle: string = text.substring(divide_numbers.prefix, divide_numbers.prefix + middle_length);
    // slice(-suffix)にすると0のときに意図しない抽出になるため注意
    const suffix: string = text.substring(divide_numbers.prefix + divide_numbers.middle);

    return {
      prefix: prefix,
      middle: middle,
      suffix: suffix,
    }
  }

  function renderingComposite(step: number | undefined = undefined): CanvasRenderingContext2D {
    const divide_text: DivideStrings = extractDivideText(getText(), getPrefix(), getSuffix(), step);
    const base_align_text: string = divide_text.prefix + divide_text.middle;
    const down_align_text: string = divide_text.suffix;

    const composite_ctx: CanvasRenderingContext2D = composite_canvas.getContext('2d') as CanvasRenderingContext2D;

    composite_ctx.clearRect(0, 0, composite_canvas.width, composite_canvas.height);
    // 白黒2値仮定で文字とテクスチャ画像を合成
    // そのため輝度調整は当処理後にpreview_canvas側で実施
    composite_ctx.globalCompositeOperation = 'xor';
    // 文字
    composite_ctx.textBaseline = 'top';
    // Safariで縦位置がずれるため補正
    const safari_adjust = is_safari ? getSize() / -2 : 0;
    setRenderingStyle(composite_ctx);
    const {width: measure_width, height: measure_height} = measureText(composite_ctx, getText());
    const {width: adjust_width, height: adjust_height} = calcAdjustSize(measure_width, measure_height);
    const down_align_offset = getAlignFactor(measure_height);
    const adjusted_left = adjust_width / 3;
    const adjusted_top = adjust_height / 2;
    composite_ctx.fillText(base_align_text, adjusted_left, adjusted_top + safari_adjust);
    const down_align_left: number = composite_ctx.measureText(base_align_text).width;
    composite_ctx.fillText(down_align_text, adjusted_left + down_align_left, adjusted_top + down_align_offset + safari_adjust);
    // テクスチャ画像
    composite_ctx.drawImage(texture_image, 0, 0);

    return composite_ctx;
  }

  function renderingPreview(step: number | undefined = undefined): void {
    if (getText().length > 0) {
      renderingComposite(step);
      const preview_ctx: CanvasRenderingContext2D = preview_canvas.getContext('2d') as CanvasRenderingContext2D;
      // Canvas CSS style filter: brightness()でも輝度表示は可能だが、gif.jsでエンコードに反映されないため透過率で代替
      preview_ctx.globalAlpha = getBrightness() / 100;
      preview_ctx.clearRect(0, 0, preview_canvas.width, preview_canvas.height);
      preview_ctx.drawImage(composite_canvas, 0, 0);
    }
  }

  function mediateURLSearchParams(url_search_params: URLSearchParams, key: string): void {
    if (url_search_params.has(key)) {
      query_parameter[key] = url_search_params.get(key) as string;
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
    // キャッシュ無し初回表示時にフォントがフォールバックされるのを抑止するためフォントロード完了してから描画
    loadFont(`italic ${getWeightStyle()} ${getSizeStyle()} ${getFont()}`).then(() => {
        adjustRenderingArea();
        renderingPreview();
        adjustGIFArea();
    });
    displayReplayURL();
    replaceBrowserURL();
    // テキストが空の場合はプレビュー・録画ボタン無効化
    preview_button_disabled = record_button_disabled = getText().length == 0;
    // 設定変更時はGIF表示・ダウンロードボタン無効化
    gif.style.visibility = 'hidden';
    download_button_disabled = true;
  }

  function encodeFrame(): void {
    // gif.jsエンコーダ内部でgetImageData()を繰り返すためChrome等でgetContext()でのwillReadFrequently指定推奨の警告が出るが
    // 指定してグローバル保持したコンテキストを渡しても内部で別途コンテキスト生成をしているらしく警告は続行しエンコードも低品質になるためCanvasを指定
    GIF_encoder.addFrame(preview_canvas, {delay: getDelay(), copy: true});
  }

  function animate(step: number, is_record: boolean): void {
    if (getText().length - getPrefix() - getSuffix() - step >= 0) {
      renderingPreview(step);
      if (is_record) {
        encodeFrame();
      }
    } else {
      window.clearTimeout(timer_id_animate);
      timer_id_animate = undefined;
      if (is_record) {
        GIF_encoder.render();
      }
      return;
    }

    let delay: number = getDelay();
    // html2canvasを利用した場合など1フレームの描画に時間がかかる場合は
    // エンコード失敗するためdelayを大き目(100ms以上)に調整するとよい
    timer_id_animate = window.setTimeout(animate, delay, step + 1, is_record);
  }

  function busyUI(is_busy: boolean): void {
    property_disabled = is_busy;
    preview_button_disabled = is_busy;
    reset_button_disabled = is_busy;
    record_button_disabled = is_busy;
    download_button_disabled = is_busy;
    document.body.style.cursor = is_busy ? 'wait': '';
  }

  // handler functions

  // async await tick()でDOM描画完了してから実行しreplaceState()でエラーが出るのを防止
  onMount(async () => {
    // Safari判定（オープニングblur適用有無・canvasテキスト描画縦位置など）
    is_safari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
    await tick(); // DOM描画完了待ち
    await loadFont('800 1em Inter'); // オープニング表示フォントロード完了待ち：（注意）CSS #omega-psycommuの指定と合わせる
    parseQueryParameter();
    reflectQueryParameter();
    timer_id_opening1 = window.setTimeout(() => {
      // その1 オープニング最終表示
      if (!is_safari) {
        // 色（輝度）によりblur度合いの感覚が異なるため補正
        omega_psycommu.style.filter = 'blur(0.5px)'
      }
      omega_psycommu.style.animationIterationCount = '1';
      omega_psycommu.style.animationFillMode = 'forwards';
      omega_psycommu.style.color = 'darkorange';
      omega_psycommu_status.style.color = '#000000';
      omega_psycommu_status.style.borderColor = 'darkorange';
      omega_psycommu_status.style.backgroundColor = 'darkorange';
      omega_psycommu_status_text = 'ACTIVE';
      omega_psycommu_link_text = 'NML';
      omega_psycommu_sync_text = 'NML';
      timer_id_opening2 = window.setTimeout(() => {
        // その2 オープニング表示を非表示して操作画面を表示
        operation.style.visibility = 'visible';
        operation.style.opacity = '1';
        now_loading.style.display = 'none';
        handleInputChanges();
      }, 1000); // オープニング最終表示の表示時間
    }, 3000); // オープニング表示時間
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
    property_suffix_align_value = valid_values.suffix_align.default.toString();
    property_delay_value = valid_values.delay.default.toString();
    query_parameter = {};
    handleInputChanges();
  }

  function onClickRecord() {
    if (getText().length - getPrefix() - getSuffix() < 0) {
      // gif.jsでaddFrame()せずにrender()するとfinishedしないためアニメーション1コマ以上必須とする
      alert('先頭または末尾固定数の合計はテキスト長以下にしてください');
      return;
    }
    GIF_encoder = new GIF({
      repeat: -1,
      quality: 1,
      width: preview_canvas.width,
      height: preview_canvas.height,
    });
    GIF_encoder.on('finished', (blob: Blob) => {
      // 最初に最終フレームが一瞬表示されたりロード中画像が乱れる事象の緩和（完全抑止ではない）のため
      // setTimeout()/requestAnimationFrame()/gif.style.visibility/gif.style.objectFitで制御
      const object_url = URL.createObjectURL(blob);
      gif.src = '';
      gif.style.visibility = 'hidden';
      setTimeout(() => {
        gif.src = object_url;
        requestAnimationFrame(() => {
          gif.style.visibility = 'visible';
          gif.style.objectFit = evacuated_gif_object_fit;
          busyUI(false);
        });
      }, 100);
    });
    busyUI(true);
    // ロード中画像
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
      // gif.src空文字列設定→再設定だとFirefoxではキャッシュでアニメーション再生されないため再生成
      async function rebuildGIF() {
        const res = await fetch(gif.src);
        const blob = await res.blob();
        if (gif.src.startsWith('blob:')) {
          URL.revokeObjectURL(gif.src);
        }
        const url = URL.createObjectURL(blob);
        gif.src = url;
      };
      rebuildGIF();
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

  function onClickNowLoading() {
    // オープニングキャンセル
    if (timer_id_opening1) {
      window.clearTimeout(timer_id_opening1);
    }
    if (timer_id_opening2) {
      window.clearTimeout(timer_id_opening2);
    }
    operation.style.visibility = 'visible';
    operation.style.opacity = '1';
    now_loading.style.display = 'none';
    handleInputChanges();
  }
</script>
<style>
  @import 'style.css';
</style>
<header>
  <h1 id="title">GQuuuuuuXアイキャッチ風アニメ画像ジェネレータ</h1>
</header>
<main>
  <div bind:this={operation} class="operation">
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
        <canvas id="preview-canvas" bind:this={preview_canvas}></canvas>
      </button>
    </div>
    <div id="work-area">
      <div>
        <canvas id="composite-canvas" bind:this={composite_canvas}></canvas>
      </div>
      <div>
        <img bind:this={texture_image} src="{base}/texture.png" alt="texture" />
      </div>
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
          <span><i class="fa-solid fa-copy"></i> コピー</span>
        </button>
        <div id="copied-balloon" class="copied_balloon" class:copied_balloon_fadeout>
          <span>コピーしました</span>
        </div>
      </div>
      <div>
        <textarea id="replay-url" bind:value={replay_url_value} readonly></textarea>
      </div>
    </div>
  </div>
  <button id="now-loading-area-button" on:click={onClickNowLoading} class="pseudo-button" aria-label="NOW LOADING">
    <div bind:this={now_loading} class="now_loading">
      <div bind:this={omega_psycommu} id="omega-psycommu" class:with-blur={!is_safari}>
        <div id="r-op-cont">R-OP-CONT</div>
        <div>OMEGA PSYCOMMU:</div>
        <div bind:this={omega_psycommu_status} id="status">{omega_psycommu_status_text}</div>
        <div>LINK: <span id="link">{omega_psycommu_link_text}</span></div>
        <div>SYNC: <span id="sync">{omega_psycommu_sync_text}</span></div>
      </div>
    </div>
  </button>
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
