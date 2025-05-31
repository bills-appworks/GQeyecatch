/**
 * @fileoverview GQuuuuuuXアイキャッチ風アニメ画像ジェネレータ
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2025
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
*/
const fontStatusMap = new Map<string, boolean>();
const fontLoadPromises = new Map<string, Promise<void>>();

export function isFontLoaded(specifiedFont: string): boolean {
  return fontStatusMap.get(specifiedFont) === true;
}

export function loadFont(specifiedFont: string): Promise<void> {
  if (fontLoadPromises.has(specifiedFont)) {
    return fontLoadPromises.get(specifiedFont)!;
  }

  const promise = (async () => {
    await document.fonts.load(specifiedFont);
    await document.fonts.ready;
    fontStatusMap.set(specifiedFont, true);
  })();

  fontLoadPromises.set(specifiedFont, promise);
  return promise;
}
