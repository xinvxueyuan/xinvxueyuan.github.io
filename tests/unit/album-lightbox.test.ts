import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  constructed: vi.fn(),
  destroy: vi.fn(),
  init: vi.fn(),
}));

vi.mock("photoswipe/style.css", () => ({}));
vi.mock("photoswipe", () => ({ default: class PhotoSwipeMock {} }));
vi.mock("photoswipe/lightbox", () => ({
  default: class LightboxMock {
    private readonly gallery: HTMLElement;

    constructor(options: unknown) {
      state.constructed(options);
      this.gallery = (options as { gallery: HTMLElement }).gallery;
    }

    private readonly handleClick = (event: Event): void => event.preventDefault();

    init() {
      state.init();
      this.gallery.addEventListener("click", this.handleClick);
    }

    destroy() {
      state.destroy();
      this.gallery.removeEventListener("click", this.handleClick);
    }
  },
}));

import AlbumLightbox from "../../src/components/interactive/AlbumLightbox.vue";

describe("AlbumLightbox Vue enhancement", () => {
  let wrapper: ReturnType<typeof mount> | undefined;
  let gallery: HTMLElement;
  let anchor: HTMLAnchorElement;

  beforeEach(() => {
    state.constructed.mockClear();
    state.init.mockClear();
    state.destroy.mockClear();
    gallery = document.createElement("div");
    gallery.dataset.albumGallery = "";
    anchor = document.createElement("a");
    anchor.href = "/images/albums/test.webp";
    anchor.textContent = "open photo";
    gallery.append(anchor);
    document.body.append(gallery);
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    gallery.remove();
  });

  it("waits for the first photo click, initializes once and destroys on unmount", async () => {
    wrapper = mount(AlbumLightbox, { attachTo: document.body });
    expect(state.constructed).not.toHaveBeenCalled();

    const click = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    anchor.dispatchEvent(click);
    await flushPromises();

    expect(click.defaultPrevented).toBe(true);
    expect(state.constructed).toHaveBeenCalledOnce();
    expect(state.init).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(anchor);

    wrapper.unmount();
    wrapper = undefined;
    expect(state.destroy).toHaveBeenCalledOnce();
  });

});
