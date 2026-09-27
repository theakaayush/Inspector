void (async () => {
  const hostId = "__inspector_extension_root";
  const existing = document.getElementById(hostId);

  if (existing) {
    return;
  }

  const css = await fetch(chrome.runtime.getURL("src/inspector.css")).then((response) => response.text());
  const host = document.createElement("div");
  host.id = hostId;
  document.documentElement.append(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = css;
  shadow.append(style);

  const $ = (tag, options = {}, children = []) => {
    const element = document.createElement(tag);

    for (const [name, value] of Object.entries(options)) {
      if (name === "className") element.className = value;
      else if (name === "text") element.textContent = value;
      else if (name === "htmlFor") element.htmlFor = value;
      else if (name === "checked") element.checked = value;
      else if (name === "disabled") element.disabled = value;
      else if (name === "value") element.value = value;
      else if (name.startsWith("on")) element.addEventListener(name.slice(2).toLowerCase(), value);
      else element.setAttribute(name, value);
    }

    for (const child of children) element.append(child);
    return element;
  };

  const button = (text, className = "") => $("button", { className, text, type: "button" });

  const svgEl = (tag, attrs = {}) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    return node;
  };

  // Heroicons outline (https://heroicons.com, MIT): 24x24, 1.5px stroke.
  // rectangle/circle are custom pictograms in the same stroke style (no Heroicons equivalent).
  const ICONS = {
    moon: ["M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"],
    sun: ["M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"],
    "x-mark": ["M6 18 18 6M6 6l12 12"],
    "arrow-uturn-left": ["M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"],
    "arrow-uturn-right": ["m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"],
    camera: ["M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z", "M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"],
    pencil: ["m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"],
    "arrow-right": ["M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"],
    "arrow-down-tray": ["M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"],
    copy: ["M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"],
    check: ["M4.5 12.75l6 6 9-13.5"],
    swatch: ["M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"],
    h1: ["M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501m4.501-8.627 2.25-1.5v10.126m0 0h-2.25m2.25 0h2.25"],
    "squares-2x2": ["M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"],
    "eye-dropper": ["m15 11.25 1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 1 0-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25l-8.47 8.47c-.34.34-.8.53-1.28.53s-.94.19-1.28.53l-.97.97-.75-.75.97-.97c.34-.34.53-.8.53-1.28s.19-.94.53-1.28L12.75 9M15 11.25 12.75 9"]
  };

  const icon = (name, size = 18) => {
    const svg = svgEl("svg", { viewBox: "0 0 24 24", width: String(size), height: String(size), fill: "none", stroke: "currentColor", "stroke-width": "1.5", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" });
    if (name === "rectangle") svg.append(svgEl("rect", { x: "4", y: "7", width: "16", height: "10", rx: "1" }));
    else if (name === "circle") svg.append(svgEl("circle", { cx: "12", cy: "12", r: "7" }));
    else for (const d of ICONS[name]) svg.append(svgEl("path", { d }));
    return svg;
  };

  const option = (text, value = text) => $("option", { text, value });
  const input = (type, value = "") => $("input", { type, value });
  const select = (values) => $("select", {}, values.map(([text, value]) => option(text, value)));
  const field = (label, control) => $("div", { className: "field" }, [$("label", { text: label }), $("div", { className: "field-control" }, [control])]);
  const details = (title, fields, open = false, iconName = null) => {
    const summary = $("summary", {}, iconName ? [icon(iconName), $("span", { text: title })] : [$("span", { text: title })]);
    return $("details", open ? { open: "" } : {}, [summary, $("div", { className: "fields" }, fields)]);
  };

  const layer = $("div", { className: "inspector-layer" });
  const selectionBox = $("div", { className: "selection" });
  const selectionLabel = $("span", { className: "selection-label" });
  selectionBox.append(selectionLabel);

  const undoButton = button("", "tool-button");
  const redoButton = button("", "tool-button");
  undoButton.replaceChildren(icon("arrow-uturn-left"));
  redoButton.replaceChildren(icon("arrow-uturn-right"));
  undoButton.setAttribute("aria-label", "Undo");
  undoButton.title = "Undo";
  redoButton.setAttribute("aria-label", "Redo");
  redoButton.title = "Redo";
  const exportButton = button("Copy CSS", "tool-button");
  exportButton.title = "Copy the CSS for your changes";
  exportButton.setAttribute("aria-label", "Copy the CSS for your changes");
  const screenshotButton = button("", "tool-button");
  screenshotButton.replaceChildren(icon("camera"));
  screenshotButton.title = "Screenshot and annotate";
  screenshotButton.setAttribute("aria-label", "Screenshot and annotate");
  const toolbar = $("div", { className: "toolbar", role: "toolbar", "aria-label": "Inspector tools" }, [
    undoButton,
    redoButton,
    $("span", { className: "tool-divider" }),
    screenshotButton,
    $("span", { className: "tool-divider" }),
    exportButton
  ]);

  const closeButton = button("", "close");
  closeButton.replaceChildren(icon("x-mark"));
  closeButton.setAttribute("aria-label", "Close Inspector");
  const themeButton = button("", "close");
  themeButton.setAttribute("aria-label", "Switch to dark mode");
  themeButton.title = "Switch to dark mode";
  const elementName = $("span", { className: "element-name", text: "Select an element" });

  const fontFamily = select([]);
  const fontSize = input("number");
  fontSize.min = "1";
  const fontUnit = select([["px", "px"], ["rem", "rem"], ["em", "em"], ["%", "%"]]);
  const fontWeight = select([["400", "400"], ["500", "500"], ["600", "600"], ["700", "700"], ["800", "800"]]);
  const lineHeight = input("number");
  lineHeight.min = "0";
  lineHeight.step = "0.1";
  const textColor = input("color", "#1f2937");
  const textColorHex = input("text", "#1F2937");
  const backgroundColor = input("color", "#ffffff");
  const backgroundColorHex = input("text", "#FFFFFF");
  const fontSizeControl = $("div", { className: "compound" }, [fontSize, fontUnit]);
  const dropper = (onPick) => {
    const drop = button("", "icon-button");
    drop.replaceChildren(icon("eye-dropper"));
    drop.title = "Pick color from page";
    drop.setAttribute("aria-label", "Pick color from page");
    drop.addEventListener("click", async () => {
      if (typeof EyeDropper === "undefined") {
        notify("Eyedropper not supported in this browser");
        return;
      }
      try {
        onPick((await new EyeDropper().open()).sRGBHex);
      } catch { /* dismissed */ }
    });
    return drop;
  };
  const textColorControl = $("div", { className: "color-control" }, [textColor, textColorHex, dropper((picked) => {
    textColor.value = picked;
    textColorHex.value = picked.toUpperCase();
    changeStyle("color", picked);
  })]);
  const backgroundColorControl = $("div", { className: "color-control" }, [backgroundColor, backgroundColorHex, dropper((picked) => {
    backgroundColor.value = picked;
    backgroundColorHex.value = picked.toUpperCase();
    changeStyle("background-color", picked);
  })]);

  const textEditor = $("textarea", { disabled: true, placeholder: "Select a text element to edit its content." });
  const textNotice = $("p", { className: "notice", text: "Select a text element to edit its content." });

  const width = input("text");
  const height = input("text");
  const sideNames = ["top", "right", "bottom", "left"];
  const sideCell = (name) => {
    const box = input("text");
    box.setAttribute("aria-label", name);
    return { box, cell: $("div", { className: "side" }, [box, $("span", { text: name })]) };
  };
  const marginSides = sideNames.map(sideCell);
  const paddingSides = sideNames.map(sideCell);
  const sidesGrid = (parts) => $("div", { className: "sides" }, parts.map((part) => part.cell));

  const typographyDetails = details("Typography", [
    field("Font family", fontFamily),
    field("Font size", fontSizeControl),
    field("Weight", fontWeight),
    field("Line height", lineHeight)
  ], true, "h1");
  const colorDetails = details("Color", [
    field("Text color", textColorControl),
    field("Background", backgroundColorControl)
  ], true, "swatch");
  const typeGroups = $("div", { className: "type-groups" });
  const stylePanel = $("section", { className: "tab-panel is-active", role: "tabpanel", "data-panel": "style" }, [
    colorDetails,
    typographyDetails,
    typeGroups
  ]);

  const textPanel = $("section", { className: "tab-panel", role: "tabpanel", "data-panel": "text" }, [
    $("div", { className: "text-field" }, [$("label", { text: "Content" }), textEditor, textNotice])
  ]);

  const layoutPanel = $("section", { className: "tab-panel", role: "tabpanel", "data-panel": "layout" }, [
    details("Size", [field("Width", width), field("Height", height)], true),
    details("Spacing", [field("Margin", sidesGrid(marginSides)), field("Padding", sidesGrid(paddingSides))])
  ]);

  const tabs = [["Style", "pencil"], ["Text", "h1"], ["Layout", "squares-2x2"]].map(([name, iconName]) => {
    const tab = button("", "tab");
    tab.append(icon(iconName), $("span", { text: name }));
    tab.dataset.tab = name.toLowerCase();
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", name === "Style" ? "true" : "false");
    return tab;
  });

  const resetButton = button("Reset", "secondary");
  const applyButton = button("Apply", "primary");
  const panel = $("aside", { className: "panel", "aria-label": "Inspector panel" }, [
    $("header", { className: "panel-header" }, [$("h1", { text: "Inspector" }), $("div", { className: "header-actions" }, [themeButton, closeButton])]),
    $("div", { className: "selection-summary" }, [$("h2", { text: "Selected element" }), elementName]),
    $("div", { className: "tabs", role: "tablist", "aria-label": "Inspector sections" }, tabs),
    stylePanel,
    textPanel,
    layoutPanel,
    $("footer", { className: "panel-footer" }, [resetButton, applyButton])
  ]);

  const exportText = $("textarea", { readonly: "", "aria-label": "CSS to copy" });
  const copyButton = button("Copy CSS", "primary");
  const dismissExport = button("Close", "secondary");
  const exportSheet = $("section", { className: "export-sheet", hidden: "", role: "dialog", "aria-modal": "true", "aria-label": "Copy CSS" }, [
    $("h2", { text: "Copy CSS" }),
    exportText,
    $("div", { className: "export-actions" }, [dismissExport, copyButton])
  ]);

  const toast = $("div", { className: "toast", role: "status" });
  layer.append(selectionBox, toolbar, panel, exportSheet, toast);
  shadow.append(layer);

  let selected = null;
  let hovered = null;
  let history = [];
  let future = [];
  let toastTimer;
  const baselines = new WeakMap();
  const edited = new Set();
  const controls = [fontFamily, fontSize, fontUnit, fontWeight, lineHeight, textColor, textColorHex, backgroundColor, backgroundColorHex, width, height, ...marginSides.map((part) => part.box), ...paddingSides.map((part) => part.box)];
  const blockedTags = new Set(["HTML", "HEAD", "SCRIPT", "STYLE", "LINK", "META", "NOSCRIPT", "TITLE"]);

  const isInspectorEvent = (event) => event.composedPath().includes(host);
  const canInspect = (element) => element instanceof Element && !blockedTags.has(element.tagName);
  const isTextEditable = (element) => element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element.children.length === 0;
  const readText = (element) => element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element.value : element.textContent;
  const writeText = (element, value) => {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) element.value = value;
    else element.textContent = value;
  };

  const describe = (element) => {
    const name = element.tagName.toLowerCase();
    const classes = [...element.classList].filter((value) => /^[a-zA-Z_-][\w-]*$/.test(value)).slice(0, 2);
    return classes.length ? `${name}.${classes.join(".")}` : name;
  };

  // ponytail: first node per distinct text style, max 4 groups; fuller tree grouping only if this falls short
  const collectTextStyles = (root) => {
    const seen = new Map();
    for (const node of root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,span,a,li,button,small,strong,em")) {
      if (node.children.length > 0 || !(node.textContent || "").trim()) continue;
      const cs = getComputedStyle(node);
      const key = [cs.fontFamily, cs.fontSize, cs.fontWeight, cs.lineHeight, cs.color].join("|");
      if (!seen.has(key)) seen.set(key, { node, nodes: [] });
      seen.get(key).nodes.push(node);
      if (seen.size >= 4) break;
    }
    return [...seen.values()];
  };

  const groupTitle = (group) => {
    const cs = getComputedStyle(group.node);
    return `Typography · ${describe(group.node)} · ${cs.fontSize} · ${cs.fontWeight}${group.nodes.length > 1 ? ` · ${group.nodes.length} texts` : ""}`;
  };

  const changeGroupStyle = (group, title, property, value) => {
    if (!value) return;
    for (const node of group.nodes) {
      if (!baselines.has(node)) baselines.set(node, snapshot(node));
      const before = node.style.getPropertyValue(property);
      if (before === value) continue;
      writeStyle(node, property, value);
      record({ target: node, type: "style", property, before, after: value });
    }
    title.querySelector("span").textContent = groupTitle(group);
    positionSelection();
  };
  const hex = (color, fallback) => {
    if (!color || color === "transparent") return fallback;
    const values = color.match(/[\d.]+/g);
    if (!values || values.length < 3) return fallback;
    if (values.length >= 4 && Number(values[3]) === 0) return fallback;
    return `#${values.slice(0, 3).map((value) => Number(value).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
  };

  // ponytail: nearest opaque ancestor only, per-descendant fill needs a fuller resolver if this falls short
  const visibleBackground = (element) => {
    let current = element;
    while (current && current instanceof Element) {
      const bg = getComputedStyle(current).backgroundColor;
      const parts = bg.match(/[\d.]+/g) || [];
      if (parts.length >= 3 && (parts.length < 4 || Number(parts[3]) > 0)) return bg;
      if (current.tagName === "HTML") break;
      current = current.parentElement;
    }
    return "rgb(255, 255, 255)";
  };

  const pageIsDark = () => {
    const parts = (visibleBackground(document.body).match(/[\d.]+/g) || []).map(Number);
    if (parts.length < 3) return false;
    return (0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2]) / 255 < 0.5;
  };

  let themeOverride = null;
  const applyTheme = () => {
    const theme = themeOverride || (pageIsDark() ? "dark" : "light");
    layer.dataset.theme = theme;
    const dark = theme === "dark";
    themeButton.replaceChildren(icon(dark ? "sun" : "moon"));
    themeButton.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    themeButton.title = themeButton.getAttribute("aria-label");
  };

  const readUnit = (value) => (value.match(/[a-z%]+$/i) || ["px"])[0];
  const readNumber = (value) => Number.parseFloat(value) || "";
  // Bare numbers need px: line-height/letter-spacing fields display computed px,
  // but a bare number sets a line-height multiplier (20.1 = 20x) or an invalid
  // letter-spacing, exploding or ignoring the change. Keywords pass through.
  const lengthValue = (value) => {
    const v = value.trim();
    return /^\d*\.?\d+$/.test(v) ? `${v}px` : v;
  };
  const setDisabled = (disabled) => {
    controls.forEach((control) => { control.disabled = disabled; });
    textEditor.disabled = disabled || !selected || !isTextEditable(selected);
    resetButton.disabled = disabled;
    applyButton.disabled = disabled;
  };

  const notify = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  };

  const positionSelection = () => {
    const target = hovered || selected;
    if (!target || !target.isConnected) {
      selectionBox.style.display = "none";
      return;
    }

    const rect = target.getBoundingClientRect();
    selectionBox.style.display = "block";
    selectionBox.style.height = `${Math.max(rect.height, 2)}px`;
    selectionBox.style.left = `${rect.left}px`;
    selectionBox.style.top = `${rect.top}px`;
    selectionBox.style.width = `${Math.max(rect.width, 2)}px`;
    selectionLabel.textContent = describe(target);
  };

  const positionOverlay = () => {
    if (!selected || !selected.isConnected) return;
    const rect = selected.getBoundingClientRect();
    const toolbarWidth = 280;
    const maxLeft = Math.max(16, window.innerWidth - Math.min(400, window.innerWidth) - toolbarWidth);
    const left = Math.max(16, Math.min(maxLeft, rect.left + (rect.width / 2) - (toolbarWidth / 2)));
    toolbar.style.left = `${left}px`;
    toolbar.style.top = `${Math.max(16, Math.min(window.innerHeight - 52, rect.top - 58))}px`;
    toolbar.style.transform = "none";
  };

  const snapshot = (element) => ({
    cssText: element.style.cssText,
    text: isTextEditable(element) ? readText(element) : null
  });

  const applySnapshot = (element, value) => {
    element.style.cssText = value.cssText;
    if (value.text !== null) writeText(element, value.text);
  };

  const updateButtons = () => {
    undoButton.disabled = history.length === 0;
    redoButton.disabled = future.length === 0;
    exportButton.disabled = !hasStyleChanges();
  };

  const record = (change) => {
    const previous = history.at(-1);
    const canMerge = previous && previous.target === change.target && previous.type === change.type && previous.property === change.property;

    if (canMerge) previous.after = change.after;
    else history.push(change);

    future = [];
    edited.add(change.target);
    updateButtons();
  };

  const writeStyle = (element, property, value) => {
    if (value) element.style.setProperty(property, value);
    else element.style.removeProperty(property);
  };

  const changeStyle = (property, value) => {
    if (!selected || !value) return;
    const before = selected.style.getPropertyValue(property);
    if (before === value) return;
    writeStyle(selected, property, value);
    record({ target: selected, type: "style", property, before, after: value });
    positionSelection();
  };

  const changeText = (value) => {
    if (!selected || !isTextEditable(selected)) return;
    const before = readText(selected);
    if (before === value) return;
    writeText(selected, value);
    record({ target: selected, type: "text", before, after: value });
  };

  const applyChange = (change, forward) => {
    const value = forward ? change.after : change.before;
    if (change.type === "style") writeStyle(change.target, change.property, value);
    else if (change.type === "text") writeText(change.target, value);
    else applySnapshot(change.target, value);
  };

  const undo = () => {
    const change = history.pop();
    if (!change) return;
    applyChange(change, false);
    future.push(change);
    if (selected && (change.target === selected || selected.contains(change.target))) populate(selected);
    updateButtons();
    positionSelection();
    positionOverlay();
  };

  const redo = () => {
    const change = future.pop();
    if (!change) return;
    applyChange(change, true);
    history.push(change);
    if (selected && (change.target === selected || selected.contains(change.target))) populate(selected);
    updateButtons();
    positionSelection();
    positionOverlay();
  };

  const populate = (element) => {
    const computed = getComputedStyle(element);
    const size = computed.fontSize;
    const unit = readUnit(size);
    fillFamilySelect(fontFamily, computed.fontFamily);
    fontSize.value = readNumber(size);
    fontUnit.value = ["px", "rem", "em", "%"].includes(unit) ? unit : "px";
    fontWeight.value = ["400", "500", "600", "700", "800"].includes(computed.fontWeight) ? computed.fontWeight : "400";
    lineHeight.value = computed.lineHeight === "normal" ? "" : readNumber(computed.lineHeight);
    textColor.value = hex(computed.color, "#1F2937");
    textColorHex.value = textColor.value;
    backgroundColor.value = hex(visibleBackground(element), "#FFFFFF");
    backgroundColorHex.value = backgroundColor.value;
    width.value = computed.width;
    height.value = computed.height;
    ["Top", "Right", "Bottom", "Left"].forEach((side, i) => {
      marginSides[i].box.value = computed[`margin${side}`];
      paddingSides[i].box.value = computed[`padding${side}`];
    });
    textEditor.value = isTextEditable(element) ? readText(element) : "";
    textNotice.textContent = isTextEditable(element) ? "Text updates preview immediately on the page." : "Select a text element rather than a container to edit content.";
    elementName.textContent = describe(element);
    // Per-element refresh: every control is overwritten from the new target, so no
    // pending font/color value travels with the pointer. Container typography is
    // edited per detected text style below — no extra pick-a-style step.
    const groups = element.children.length > 0 ? collectTextStyles(element) : [];
    typeGroups.replaceChildren(...groups.map((group, index) => {
      const first = getComputedStyle(group.node);
      const family = select([]);
      fillFamilySelect(family, first.fontFamily);
      const size = input("number", readNumber(first.fontSize));
      size.min = "1";
      const unit = select([["px", "px"], ["rem", "rem"], ["em", "em"], ["%", "%"]]);
      unit.value = ["px", "rem", "em", "%"].includes(readUnit(first.fontSize)) ? readUnit(first.fontSize) : "px";
      const weight = select([["400", "400"], ["500", "500"], ["600", "600"], ["700", "700"], ["800", "800"]]);
      weight.value = ["400", "500", "600", "700", "800"].includes(first.fontWeight) ? first.fontWeight : "400";
      const height = input("text", first.lineHeight === "normal" ? "" : first.lineHeight);
      const spacing = input("text", first.letterSpacing === "normal" ? "" : first.letterSpacing);
      const picker = input("color", hex(first.color, "#1F2937"));
      const hexIn = input("text", hex(first.color, "#1F2937"));
      const colorRow = $("div", { className: "color-control" }, [picker, hexIn]);
      const section = details(groupTitle(group), [
        field("Font family", family),
        field("Font size", $("div", { className: "compound" }, [size, unit])),
        field("Weight", weight),
        field("Line height", height),
        field("Letter spacing", spacing),
        field("Text color", colorRow)
      ], index === 0, "h1");
      const title = section.querySelector("summary");
      colorRow.append(dropper((picked) => {
        picker.value = picked;
        hexIn.value = picked.toUpperCase();
        changeGroupStyle(group, title, "color", picked);
      }));
      family.addEventListener("change", () => changeGroupStyle(group, title, "font-family", quoteFamily(family.value)));
      size.addEventListener("input", () => changeGroupStyle(group, title, "font-size", `${size.value}${unit.value}`));
      unit.addEventListener("change", () => changeGroupStyle(group, title, "font-size", `${size.value}${unit.value}`));
      weight.addEventListener("change", () => changeGroupStyle(group, title, "font-weight", weight.value));
      height.addEventListener("input", () => changeGroupStyle(group, title, "line-height", lengthValue(height.value)));
      spacing.addEventListener("input", () => changeGroupStyle(group, title, "letter-spacing", lengthValue(spacing.value)));
      picker.addEventListener("input", () => {
        hexIn.value = picker.value.toUpperCase();
        changeGroupStyle(group, title, "color", picker.value);
      });
      hexIn.addEventListener("input", () => {
        const value = hexIn.value.trim();
        if (!/^#[0-9a-f]{6}$/i.test(value)) return;
        picker.value = value;
        changeGroupStyle(group, title, "color", value);
      });
      return section;
    }));
    // Direct container typography edits nothing visible (inherits down), so hide it when groups exist.
    typographyDetails.hidden = groups.length > 0;
    typographyDetails.open = groups.length === 0;
    colorDetails.open = true;
    setDisabled(false);
  };

  const selectElement = (element) => {
    if (!canInspect(element) || element === host) return;
    if (shadow.activeElement && shadow.activeElement.blur) shadow.activeElement.blur();
    selected = element;
    hovered = null;
    if (!baselines.has(element)) baselines.set(element, snapshot(element));
    populate(element);
    positionSelection();
    positionOverlay();
  };

  const deselect = () => {
    selected = null;
    hovered = null;
    elementName.textContent = "Select an element";
    typeGroups.replaceChildren();
    typographyDetails.hidden = false;
    typographyDetails.open = true;
    setDisabled(true);
  };

  const reset = () => {
    if (!edited.size && !selected) return;
    for (const element of edited) {
      if (baselines.has(element)) applySnapshot(element, baselines.get(element));
    }
    history = [];
    future = [];
    edited.clear();
    updateButtons();
    deselect();
    positionSelection();
    positionOverlay();
    notify("All changes reset");
  };

  const declarations = (cssText) => {
    const holder = document.createElement("i").style;
    holder.cssText = cssText;
    return new Map([...holder].map((property) => [property, `${holder.getPropertyValue(property)}${holder.getPropertyPriority(property) ? " !important" : ""}`]));
  };

  const hasStyleChanges = () => {
    for (const element of edited) {
      if (!element.isConnected || !baselines.has(element)) continue;
      const before = declarations(baselines.get(element).cssText);
      const after = declarations(element.style.cssText);
      if ([...after].some(([property, value]) => before.get(property) !== value)) return true;
    }
    return false;
  };

  const selectorFor = (element) => {
    const parts = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      if (current.id) {
        parts.unshift(`#${CSS.escape(current.id)}`);
        break;
      }

      let part = current.tagName.toLowerCase();
      const siblings = current.parentElement ? [...current.parentElement.children].filter((sibling) => sibling.tagName === current.tagName) : [];
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      parts.unshift(part);
      if (current.tagName === "BODY") break;
      current = current.parentElement;
    }

    return parts.join(" > ");
  };

  const cssForEdits = () => {
    const rules = [];

    for (const element of edited) {
      if (!element.isConnected || !baselines.has(element)) continue;
      const before = declarations(baselines.get(element).cssText);
      const after = declarations(element.style.cssText);
      const changes = [...after].filter(([property, value]) => before.get(property) !== value);
      if (!changes.length) continue;
      const lines = changes.map(([property, value]) => `  ${property}: ${value};`).join("\n");
      rules.push(`${selectorFor(element)} {\n${lines}\n}`);
    }

    return rules.join("\n\n") || "/* No style changes to export. */";
  };

  const openExport = () => {
    exportText.value = cssForEdits();
    exportSheet.hidden = false;
    exportText.focus();
    exportText.select();
  };

  const copyCss = async () => {
    const value = exportText.value;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      exportText.select();
      document.execCommand("copy");
    }

    notify("CSS copied");
  };

  const shotColors = ["#111111", "#FFFFFF", "#EF4444", "#3B82F6", "#22C55E"];
  let shot = null;
  const shotCanvas = $("canvas", { className: "shot-canvas", "aria-label": "Screenshot to annotate" });
  const shotBar = $("div", { className: "toolbar shotbar", role: "toolbar", "aria-label": "Annotate screenshot" });
  const shotToolButtons = {};
  for (const [tool, iconName, label] of [["pen", "pencil", "Pen"], ["arrow", "arrow-right", "Arrow"], ["rectangle", "rectangle", "Rectangle"], ["circle", "circle", "Circle"]]) {
    const toolButton = button("", "tool-button");
    toolButton.replaceChildren(icon(iconName));
    toolButton.title = label;
    toolButton.setAttribute("aria-label", label);
    toolButton.setAttribute("aria-pressed", "false");
    toolButton.addEventListener("click", () => {
      if (shot) {
        shot.tool = tool;
        syncShotBar();
      }
    });
    shotToolButtons[tool] = toolButton;
    shotBar.append(toolButton);
  }
  shotBar.append($("span", { className: "tool-divider" }));
  const shotColorButtons = {};
  for (const color of shotColors) {
    const swatch = button("", "tool-button swatch");
    swatch.style.background = color;
    swatch.title = color;
    swatch.setAttribute("aria-label", `Color ${color}`);
    swatch.setAttribute("aria-pressed", "false");
    swatch.addEventListener("click", () => {
      if (shot) {
        shot.color = color;
        syncShotBar();
      }
    });
    shotColorButtons[color] = swatch;
    shotBar.append(swatch);
  }
  shotBar.append($("span", { className: "tool-divider" }));
  const saveButton = button("", "tool-button");
  saveButton.replaceChildren(icon("arrow-down-tray"));
  saveButton.title = "Save image";
  saveButton.setAttribute("aria-label", "Save image");
  saveButton.addEventListener("click", () => saveShot());
  const copyImageButton = button("", "tool-button");
  copyImageButton.replaceChildren(icon("copy"));
  copyImageButton.title = "Copy image";
  copyImageButton.setAttribute("aria-label", "Copy image");
  copyImageButton.addEventListener("click", () => copyShot());
  const shotCloseButton = button("", "tool-button");
  shotCloseButton.replaceChildren(icon("x-mark"));
  shotCloseButton.title = "Close and resume";
  shotCloseButton.setAttribute("aria-label", "Close and resume");
  shotCloseButton.addEventListener("click", () => exitShot());
  shotBar.append(saveButton, copyImageButton, shotCloseButton);
  shotBar.hidden = true;

  const syncShotBar = () => {
    for (const [tool, control] of Object.entries(shotToolButtons)) {
      const on = !!shot && shot.tool === tool;
      control.classList.toggle("is-active", on);
      control.setAttribute("aria-pressed", String(on));
    }
    for (const [color, control] of Object.entries(shotColorButtons)) {
      const on = !!shot && shot.color === color;
      control.classList.toggle("is-active", on);
      control.setAttribute("aria-pressed", String(on));
    }
  };

  const normRect = (stroke) => {
    const [[x1, y1], [x2, y2]] = stroke.points;
    return [Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1)];
  };

  const drawStroke = (ctx, stroke) => {
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (stroke.tool === "pen") {
      stroke.points.forEach((point, i) => (i ? ctx.lineTo(point[0], point[1]) : ctx.moveTo(point[0], point[1])));
      ctx.stroke();
    } else if (stroke.tool === "rectangle") {
      ctx.strokeRect(...normRect(stroke));
    } else if (stroke.tool === "circle") {
      const [x, y, w, h] = normRect(stroke);
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, Math.max(w / 2, 1), Math.max(h / 2, 1), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (stroke.tool === "arrow" && stroke.points.length > 1) {
      const [[x1, y1], [x2, y2]] = stroke.points;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const head = 16;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 7), y2 - head * Math.sin(angle - Math.PI / 7));
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 7), y2 - head * Math.sin(angle + Math.PI / 7));
      ctx.stroke();
    }
  };

  const redrawShot = () => {
    if (!shot) return;
    shot.ctx.clearRect(0, 0, shot.canvas.width, shot.canvas.height);
    shot.ctx.drawImage(shot.img, 0, 0);
    for (const stroke of shot.strokes) drawStroke(shot.ctx, stroke);
    if (shot.draft) drawStroke(shot.ctx, shot.draft);
  };

  const toImagePoint = (event) => {
    const rect = shot.canvas.getBoundingClientRect();
    return [
      ((event.clientX - rect.left) * shot.canvas.width) / rect.width,
      ((event.clientY - rect.top) * shot.canvas.height) / rect.height
    ];
  };

  shotCanvas.addEventListener("pointerdown", (event) => {
    if (!shot) return;
    event.preventDefault();
    shotCanvas.setPointerCapture(event.pointerId);
    shot.draft = { tool: shot.tool, color: shot.color, points: [toImagePoint(event)] };
  });

  shotCanvas.addEventListener("pointermove", (event) => {
    if (!shot || !shot.draft) return;
    event.preventDefault();
    if (shot.draft.tool === "pen") shot.draft.points.push(toImagePoint(event));
    else shot.draft.points[1] = toImagePoint(event);
    redrawShot();
  });

  const finishStroke = () => {
    if (!shot || !shot.draft) return;
    const draft = shot.draft;
    shot.draft = null;
    const longEnough = draft.tool === "pen"
      ? draft.points.length > 1
      : draft.points.length > 1 && Math.hypot(draft.points[1][0] - draft.points[0][0], draft.points[1][1] - draft.points[0][1]) > 3;
    if (longEnough) shot.strokes.push(draft);
    redrawShot();
  };

  shotCanvas.addEventListener("pointerup", finishStroke);
  shotCanvas.addEventListener("pointercancel", finishStroke);

  const enterShot = async () => {
    if (shot) return;
    notify("Capturing…");
    host.style.visibility = "hidden";
    let response = null;
    try {
      response = await chrome.runtime.sendMessage({ type: "inspector:capture" });
    } catch {
      response = null;
    }
    host.style.visibility = "";
    if (!response || !response.ok) {
      notify("Screenshot failed");
      return;
    }
    const img = new Image();
    img.onload = () => {
      exportSheet.hidden = true;
      hovered = null;
      toolbar.hidden = true;
      panel.hidden = true;
      shotCanvas.width = img.naturalWidth;
      shotCanvas.height = img.naturalHeight;
      shot = { img, canvas: shotCanvas, ctx: shotCanvas.getContext("2d"), strokes: [], draft: null, tool: "pen", color: "#EF4444" };
      layer.append(shotCanvas, shotBar);
      shotBar.hidden = false;
      syncShotBar();
      redrawShot();
      positionSelection();
    };
    img.onerror = () => notify("Screenshot failed");
    img.src = response.dataUrl;
  };

  const exitShot = () => {
    if (!shot) return;
    shot = null;
    shotCanvas.remove();
    shotBar.remove();
    shotBar.hidden = true;
    toolbar.hidden = false;
    panel.hidden = false;
    positionSelection();
    positionOverlay();
  };

  const copyShot = async () => {
    if (!shot) return;
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard || !navigator.clipboard.write) {
      notify("Copy not supported in this browser");
      return;
    }
    redrawShot();
    const blob = await new Promise((resolve) => shot.canvas.toBlob(resolve, "image/png"));
    if (!blob) {
      notify("Copy failed");
      return;
    }
    try {
      try {
        await navigator.permissions.query({ name: "clipboard-write" });
      } catch {
        /* permission query unsupported — attempt the write directly */
      }
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      flashCopySuccess();
      notify("Image copied");
    } catch {
      notify("Copy blocked — allow Clipboard for this site");
    }
  };

  let copyRevertTimer;
  const flashCopySuccess = () => {
    copyImageButton.replaceChildren(icon("check"));
    copyImageButton.style.color = "#22C55E";
    clearTimeout(copyRevertTimer);
    copyRevertTimer = setTimeout(() => {
      copyImageButton.replaceChildren(icon("copy"));
      copyImageButton.style.color = "";
    }, 1600);
  };

  const saveShot = () => {
    if (!shot) return;
    redrawShot();
    shot.canvas.toBlob((blob) => {
      if (!blob) {
        notify("Save failed");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inspector-${Date.now()}.png`;
      layer.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      exitShot();
      notify("Image saved");
    }, "image/png");
  };

  const close = () => {
    document.removeEventListener("pointermove", onPointerMove, true);
    document.removeEventListener("click", onPageClick, true);
    document.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("resize", reposition);
    window.removeEventListener("scroll", reposition, true);
    host.remove();
  };

  const onPointerMove = (event) => {
    if (isInspectorEvent(event) || !canInspect(event.target)) return;
    hovered = event.target;
    positionSelection();
  };

  const onPageClick = (event) => {
    if (isInspectorEvent(event) || !canInspect(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    selectElement(event.target);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape" && shot) {
      exitShot();
      return;
    }
    if (event.key === "Escape" && hovered) {
      hovered = null;
      positionSelection();
    }
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => {
    const active = tab.dataset.tab;
    tabs.forEach((candidate) => candidate.setAttribute("aria-selected", String(candidate === tab)));
    [stylePanel, textPanel, layoutPanel].forEach((candidate) => candidate.classList.toggle("is-active", candidate.dataset.panel === active));
  }));

  undoButton.addEventListener("click", undo);
  redoButton.addEventListener("click", redo);
  exportButton.addEventListener("click", openExport);
  screenshotButton.addEventListener("click", enterShot);
  resetButton.addEventListener("click", reset);
  applyButton.addEventListener("click", () => notify("Applied to this tab"));
  closeButton.addEventListener("click", close);
  themeButton.addEventListener("click", () => {
    themeOverride = layer.dataset.theme === "dark" ? "light" : "dark";
    applyTheme();
  });
  dismissExport.addEventListener("click", () => { exportSheet.hidden = true; });
  copyButton.addEventListener("click", copyCss);

  fontFamily.addEventListener("change", () => changeStyle("font-family", quoteFamily(fontFamily.value)));
  fontSize.addEventListener("input", () => changeStyle("font-size", `${fontSize.value}${fontUnit.value}`));
  fontUnit.addEventListener("change", () => changeStyle("font-size", `${fontSize.value}${fontUnit.value}`));
  fontWeight.addEventListener("change", () => changeStyle("font-weight", fontWeight.value));
  lineHeight.addEventListener("input", () => changeStyle("line-height", lengthValue(lineHeight.value)));
  width.addEventListener("input", () => changeStyle("width", width.value));
  height.addEventListener("input", () => changeStyle("height", height.value));
  ["top", "right", "bottom", "left"].forEach((side, i) => {
    marginSides[i].box.addEventListener("input", () => changeStyle(`margin-${side}`, marginSides[i].box.value));
    paddingSides[i].box.addEventListener("input", () => changeStyle(`padding-${side}`, paddingSides[i].box.value));
  });
  textEditor.addEventListener("input", () => changeText(textEditor.value));

  const bindColor = (picker, hexInput, property) => {
    picker.addEventListener("input", () => {
      hexInput.value = picker.value.toUpperCase();
      changeStyle(property, picker.value);
    });
    hexInput.addEventListener("input", () => {
      const value = hexInput.value.trim();
      if (!/^#[0-9a-f]{6}$/i.test(value)) return;
      picker.value = value;
      changeStyle(property, value);
    });
  };

  bindColor(textColor, textColorHex, "color");
  bindColor(backgroundColor, backgroundColorHex, "background-color");

  let fontNames = ["DM Sans", "Inter", "Arial", "Helvetica", "Georgia", "Times New Roman", "Verdana", "Courier New", "system-ui", "serif", "sans-serif", "monospace"];
  const quoteFamily = (name) => /^(serif|sans-serif|monospace|cursive|fantasy|system-ui)$/.test(name) ? name : `"${name.replace(/"/g, "")}"`;
  const fillFamilySelect = (sel, stack) => {
    sel.replaceChildren(...fontNames.map((name) => option(name, name)));
    const first = String(stack).split(",")[0].trim().replace(/^["']|["']$/g, "");
    if (first && ![...sel.options].some((o) => o.value === first)) sel.prepend(option(`${first} (current)`, first));
    if (first) sel.value = first;
  };
  // ponytail: Local Font Access API when permitted, curated system list otherwise; per-font preview skipped
  const fillFonts = async () => {
    try {
      if ("queryLocalFonts" in window) {
        const permission = await navigator.permissions.query({ name: "local-fonts" });
        if (permission.state !== "denied") fontNames = [...new Set((await window.queryLocalFonts()).map((face) => face.family))].sort((a, b) => a.localeCompare(b));
      }
    } catch {
      /* keep curated list */
    }
    if (selected) populate(selected);
  };

  const reposition = () => { positionSelection(); positionOverlay(); };
  document.addEventListener("pointermove", onPointerMove, true);
  document.addEventListener("click", onPageClick, true);
  document.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("resize", reposition);
  window.addEventListener("scroll", reposition, true);
  setDisabled(true);
  updateButtons();
  positionSelection();
  applyTheme();
  fillFonts();
})();
