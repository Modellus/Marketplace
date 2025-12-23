const apiBase = "https://modellus-api.interactivebook.workers.dev";
const sessionKey = "mp.session";
const filters = [
  { key: "all", text: "All", query: "" },
  { key: "favorite", text: "Favorite", query: "favorite" },
  { key: "sciences", text: "Sciences", query: "sciences" },
  { key: "education", text: "Education Levels", query: "education" }
];
DevExpress.config({ licenseKey: 'ewogICJmb3JtYXQiOiAxLAogICJjdXN0b21lcklkIjogImNmOWZhNjAzLTI4ZTAtMTFlMi05NWQwLTAwMjE5YjhiNTA0NyIsCiAgIm1heFZlcnNpb25BbGxvd2VkIjogMjUxCn0=.HCqYKF15Krg++10hQyJyCeml3sygMFCr47zMJkW4jeXktXehF3um5KXOxJIzXPSawem8oGxQVUIbMFNH8rwoA5esgYplJhs9KN/N30BkHJ+P6x1d0GZFoj/KEteI8kttNyDLPA==' });

class ModelsApp {
  constructor() {
    this.elements = {
      pageModels: document.getElementById("page-models"),
      navLogin: document.getElementById("nav-login"),
      navModels: document.getElementById("nav-models"),
      navLogout: document.getElementById("nav-logout"),
      userChip: document.getElementById("user-chip"),
      status: document.getElementById("status"),
      drawerShell: document.getElementById("drawer-shell"),
      drawerHost: document.getElementById("drawer"),
      cardView: document.getElementById("models-card-view"),
      toolbar: document.getElementById("toolbar")
    };
    this.state = {
      session: this.readSession(),
      filter: filters[0]
    };
    if (!this.state.session) window.location.href = "/login.html";
    this.cardViewInstance = null;
    this.drawerInstance = null;
    this.filterListInstance = null;
    this.toolbarInstance = null;
    this.bindNav();
    this.initDrawer();
    this.initToolbar();
    this.renderUser();
    this.loadModels();
  }
  readSession() {
    try {
      const stored = localStorage.getItem(sessionKey);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      return null;
    }
  }
  saveSession(session) {
    localStorage.setItem(sessionKey, JSON.stringify(session));
  }
  clearSession() {
    localStorage.removeItem(sessionKey);
  }
  setStatus(message, isError = false) {
    this.elements.status.textContent = message || "";
    this.elements.status.classList.toggle("error", Boolean(isError));
  }
  renderUser() {
    if (!this.state.session) this.elements.userChip.textContent = "Signed out";
    if (this.state.session) this.elements.userChip.textContent = `Signed in as ${this.state.session.name || "User"}`;
    this.elements.navLogout.classList.toggle("hidden", !this.state.session);
    this.elements.navModels.classList.toggle("hidden", !this.state.session);
  }
  ensureCardView() {
    if (this.cardViewInstance || !this.elements.cardView || !window.DevExpress || !DevExpress.ui || !DevExpress.ui.dxCardView) return;
    const CardView = DevExpress.ui.dxCardView;
    this.cardViewInstance = new CardView(this.elements.cardView, {
      dataSource: [],
      height: "100%",
      showBorders: false,
      focusStateEnabled: false,
      hoverStateEnabled: false,
      allowColumnReordering: false,
      allowColumnResizing: false,
      columnHidingEnabled: true,
      colCount: 3,
      colCountByScreen: { lg: 3, md: 2, sm: 1, xs: 1 },
      columns: [
        { dataField: "title", caption: "Title" },
        { dataField: "description", caption: "Description" },
        { dataField: "type", caption: "Type" },
        { dataField: "status", caption: "Status" },
        { dataField: "complexity", caption: "Complexity" },
        { dataField: "usageCount", caption: "Usage" }
      ],
      cardTemplate: (cardData, cardElement) => {
        const host = cardElement && cardElement.get ? cardElement.get(0) : cardElement;
        const data = cardData && cardData.card && cardData.card.data ? cardData.card.data : cardData || {};
        if (!host) return;
        const cardMarkup = `
          <div class="card-tile">
            <h3 class="card-title">${data.title || data.name || "Untitled model"}</h3>
            <p class="card-desc">${data.description || data.subtitle || "No description provided."}</p>
            <div class="card-badges">
              <span class="card-badge" style="${data.type ? "" : "display: none;"}">Type: ${data.type || ""}</span>
              <span class="card-badge" style="${data.status ? "" : "display: none;"}">Status: ${data.status || ""}</span>
              <span class="card-badge" style="${data.complexity ? "" : "display: none;"}">Level: ${data.complexity || ""}</span>
              <span class="card-badge">Usage: ${data.usageCount ?? 0}</span>
            </div>
            <button class="favorite-button${data.user_interaction_is_favorite ? " is-favorite" : ""}" aria-label="${data.user_interaction_is_favorite ? "Unfavorite" : "Favorite"}">
              <i class="${data.user_interaction_is_favorite ? "fa-solid fa-star favorite-icon" : "fa-regular fa-star favorite-icon"}" aria-hidden="true"></i>
            </button>
          </div>
        `;
        host.innerHTML = cardMarkup;
        const favoriteButton = host.querySelector(".favorite-button");
        if (favoriteButton) favoriteButton.addEventListener("click", () => this.toggleFavorite(data, !isFavorite));
      }
    });
  }
  renderModels(items) {
    this.ensureCardView();
    if (this.cardViewInstance) this.cardViewInstance.option("dataSource", items);
    if (!items.length) this.setStatus("No models found.");
  }
  async loadModels(filter = this.state.filter) {
    this.setStatus("Loading models…");
    try {
      const activeFilter = filter || filters[0];
      this.state.filter = activeFilter;
      const items = activeFilter.key === "favorite" ? await this.fetchFavoriteModels() : await this.fetchModels(activeFilter);
      this.setStatus(items.length ? "" : "No models found.");
      this.renderModels(items);
      this.refreshFilterSelection();
    } catch (error) {
      this.setStatus(error && error.message ? error.message : "Failed to load models.", true);
      this.renderModels([]);
    }
  }
  async fetchModels(filter) {
    const headers = this.buildAuthHeaders();
    const url = new URL(`${apiBase}/models`);
    if (filter && filter.key !== "all" && filter.query) url.searchParams.set("filter", filter.query);
    if (this.state.session && this.state.session.userId) url.searchParams.set("user_id", this.state.session.userId);
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }
  async fetchFavoriteModels() {
    if (!this.state.session || !this.state.session.token) throw new Error("Sign-in required to load favorites.");
    if (!this.state.session.userId) throw new Error("Missing user id for favorites.");
    const headers = this.buildAuthHeaders();
    const url = new URL(`${apiBase}/models`);
    url.searchParams.set("user_id", this.state.session.userId);
    url.searchParams.set("is_favorite", "1");
    url.searchParams.set("filter", "favorite");
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }
  buildAuthHeaders() {
    const headers = {};
    if (this.state.session && this.state.session.token) headers.Authorization = `Bearer ${this.state.session.token}`;
    return headers;
  }
  async toggleFavorite(modelData, shouldFavorite) {
    if (!modelData || !modelData.id) return;
    if (!this.state.session || !this.state.session.token) return;
    if (!this.state.session.userId) return;
    const currentFavoriteState = this.isFavoriteValue(modelData);
    const desiredFavoriteState = typeof shouldFavorite === "boolean" ? shouldFavorite : !currentFavoriteState;
    try {
      const response = await fetch(`${apiBase}/user-model-interactions`, {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, this.buildAuthHeaders()),
        body: JSON.stringify({
          model_id: modelData.id,
          user_id: this.state.session.userId,
          is_favorite: desiredFavoriteState
        })
      });
      if (!response.ok) throw new Error(`Favorite failed (${response.status})`);
      this.loadModels(this.state.filter);
    } catch (error) {
      this.setStatus(error && error.message ? error.message : "Failed to mark favorite.", true);
    }
  }
  initDrawer() {
    if (this.drawerInstance || !this.elements.drawerHost || !window.DevExpress || !DevExpress.ui || !DevExpress.ui.dxDrawer) return;
    const listHost = document.createElement("div");
    this.drawerInstance = new DevExpress.ui.dxDrawer(this.elements.drawerHost, {
      opened: true,
      minSize: 220,
      maxSize: 260,
      revealMode: "expand",
      openedStateMode: "shrink",
      template: () => listHost,
      shading: false
    });
    this.filterListInstance = new DevExpress.ui.dxList(listHost, {
      items: filters,
      selectionMode: "single",
      selectedItem: filters[0],
      focusStateEnabled: false,
      hoverStateEnabled: true,
      onItemClick: event => {
        if (event && event.itemData) {
          this.state.filter = event.itemData;
          this.loadModels(event.itemData);
        }
      }
    });
  }
  refreshFilterSelection() {
    if (this.filterListInstance && this.state.filter) this.filterListInstance.option("selectedItem", this.state.filter);
  }
  toggleDrawer() {
    if (!this.drawerInstance || !this.elements.drawerShell) return;
    const isOpen = this.drawerInstance.option("opened");
    this.drawerInstance.option("opened", !isOpen);
    this.elements.drawerShell.classList.toggle("drawer-collapsed", isOpen);
  }
  initToolbar() {
    if (this.toolbarInstance || !this.elements.toolbar || !window.DevExpress || !DevExpress.ui || !DevExpress.ui.dxToolbar) return;
    this.toolbarInstance = new DevExpress.ui.dxToolbar(this.elements.toolbar, {
      items: [
        {
          widget: "dxButton",
          options: {
            onClick: () => this.toggleDrawer(),
            elementAttr: { "aria-label": "Toggle Filters" },
            template: (_, contentElement) => {
              const host = contentElement && contentElement.get ? contentElement.get(0) : contentElement;
              if (!host) return;
              host.innerHTML = "";
              const iconElement = document.createElement("i");
              iconElement.className = "fa-solid fa-sidebar";
              iconElement.style.fontSize = "16px";
              host.appendChild(iconElement);
            }
          },
          location: "before"
        },
        { locateInMenu: "never", location: "after" }
      ]
    });
  }
  bindNav() {
    this.elements.navLogin.addEventListener("click", () => window.location.href = "/login.html");
    this.elements.navModels.addEventListener("click", () => window.location.href = "/models.html");
    this.elements.navLogout.addEventListener("click", () => {
      this.state.session = null;
      this.clearSession();
      window.location.href = "/login.html";
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new ModelsApp();
});
