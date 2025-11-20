export class AppShell {
  constructor({
    mount,
    store,
    onLogout,
    onStartDirect,
    onViewChange,
    onSelectRoom,
    chatPanel,
    friendPanel,
    profilePanel,
    groupPanel,
    settingsPanel,
  }) {
    this.mount = mount;
    this.store = store;
    this.onLogout = onLogout;
    this.onStartDirect = onStartDirect;
    this.onViewChange = onViewChange;
    this.onSelectRoom = onSelectRoom;
    this.chatPanel = chatPanel;
    this.friendPanel = friendPanel;
    this.profilePanel = profilePanel;
    this.groupPanel = groupPanel;
    this.settingsPanel = settingsPanel;
    this.mount.innerHTML = this.getTemplate();
    this.sidebarContent = this.mount.querySelector("[data-sidebar-content]");
    this.sidebarTitle = this.mount.querySelector("[data-sidebar-title]");
    this.navButtons = this.mount.querySelectorAll(".nav-btn[data-view]");
    this.userAvatar = this.mount.querySelector("[data-user-avatar]");
    this.userDropdown = this.mount.querySelector("[data-user-dropdown]");
    this.searchInput = this.mount.querySelector("[data-search-input]");
    this.slots = {
      chat: this.mount.querySelector('[data-slot="chat"]'),
      friends: this.mount.querySelector('[data-slot="friends"]'),
      groups: this.mount.querySelector('[data-slot="groups"]'),
      profile: this.mount.querySelector('[data-slot="profile"]'),
      settings: this.mount.querySelector('[data-slot="settings"]'),
    };
    this.bindEvents();
    this.chatPanel.mount(this.slots.chat);
    this.friendPanel.mount(this.slots.friends);
    this.profilePanel.mount(this.slots.profile);
    if (this.groupPanel) this.groupPanel.mount(this.slots.groups);
    if (this.settingsPanel) this.settingsPanel.mount(this.slots.settings);
    this.unsubscribe = this.store.subscribe((state) => this.render(state));
    this.render(this.store.getState());
  }

  bindEvents() {
    // Logout button
    this.mount
      .querySelector('[data-action="logout"]')
      .addEventListener("click", this.onLogout);

    // Navigation buttons
    this.navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.onViewChange(btn.dataset.view);
        this.navButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // User dropdown menu
    const toggleBtn = this.mount.querySelector("[data-toggle-menu]");
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.userDropdown.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      this.userDropdown.classList.remove("show");
    });

    // Dropdown menu items
    this.userDropdown.querySelectorAll("button[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.onViewChange(btn.dataset.view);
        this.userDropdown.classList.remove("show");
      });
    });

    // Search input
    this.searchInput.addEventListener("input", (e) => {
      this.filterSidebar(e.target.value);
    });
  }

  render(state) {
    // Update user avatar
    if (state.user) {
      const initial = (state.user.displayName || state.user.phone || "U")
        .charAt(0)
        .toUpperCase();

      if (state.user.avatarUrl) {
        // Show image avatar
        this.userAvatar.innerHTML = `<img src="${state.user.avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
      } else {
        // Show initial avatar
        this.userAvatar.textContent = initial;
      }
    }

    // Update active view buttons
    this.navButtons.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.view === state.view)
    );

    // Always show sidebar and render appropriate content
    const sidebar = this.mount.querySelector(".sidebar");
    sidebar.style.display = "flex";
    this.renderSidebar(state);

    // Toggle content slots
    Object.keys(this.slots).forEach((key) => {
      this.slots[key].style.display =
        state.view === key ? (key === "chat" ? "flex" : "block") : "none";
    });
  }

  renderSidebar(state) {
    const view = state.view;

    if (view === "chat") {
      // Show both friends and groups for chat view
      this.sidebarTitle.innerHTML = "<h3>Trò chuyện</h3>";
      this.renderCombinedList(state);
    } else if (view === "friends") {
      // Show only friends for friends view
      this.sidebarTitle.innerHTML = "<h3>Bạn bè</h3>";
      this.renderFriendsList(state);
    } else if (view === "groups") {
      // Show only groups for groups view
      this.sidebarTitle.innerHTML = "<h3>Nhóm</h3>";
      this.renderGroupsList(state);
    } else if (view === "profile") {
      // Show profile menu for profile view
      this.sidebarTitle.innerHTML = "<h3>Trang cá nhân</h3>";
      this.renderProfileMenu(state);
    } else if (view === "settings") {
      // Show settings menu for settings view
      this.sidebarTitle.innerHTML = "<h3>Cài đặt</h3>";
      this.renderSettingsMenu(state);
    } else {
      this.sidebarContent.innerHTML = "";
    }
  }

  renderCombinedList(state) {
    let html = "";

    // Add friends section
    if (state.friends && state.friends.length > 0) {
      html += '<div class="sidebar-section-title">Bạn bè</div>';

      state.friends.forEach((friend) => {
        const initial = (
          friend.display_name ||
          friend.displayName ||
          friend.phone ||
          "U"
        )
          .charAt(0)
          .toUpperCase();
        const isOnline = this.store.isUserOnline(friend.id);
        const name = friend.display_name || friend.displayName || friend.phone;
        const avatarUrl = friend.avatar_url || friend.avatarUrl;

        const directRoom = state.rooms
          ? state.rooms.find(
              (r) => !r.is_group && r.members && r.members.includes(friend.id)
            )
          : null;
        const isActive = directRoom && state.currentRoomId === directRoom.id;

        // Avatar content: image or initial
        const avatarContent = avatarUrl
          ? `<img src="${avatarUrl}" alt="${this.escape(
              name
            )}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
          : initial;

        html += `
          <div class="sidebar-item ${
            isActive ? "active" : ""
          }" data-friend-id="${friend.id}">
            <div class="sidebar-avatar ${
              isOnline ? "online" : "offline"
            }">${avatarContent}</div>
            <div class="sidebar-info">
              <strong>${this.escape(name)}</strong>
              <small class="status-text">${
                isOnline ? "Trực tuyến" : "Ngoại tuyến"
              }</small>
            </div>
            <div class="online-indicator ${
              isOnline ? "online" : "offline"
            }"></div>
          </div>
        `;
      });
    }

    // Add groups section
    const groups = state.rooms ? state.rooms.filter((r) => r.is_group) : [];
    if (groups.length > 0) {
      html += '<div class="sidebar-section-title">Nhóm</div>';

      groups.forEach((group) => {
        const initial = group.name.charAt(0).toUpperCase();
        const members = group.members ? group.members.split(",").length : 0;
        const lastMessage = this.getLastMessage(state, group.id);
        const isActive = state.currentRoomId === group.id;

        html += `
          <div class="sidebar-item ${isActive ? "active" : ""}" data-room-id="${
          group.id
        }">
            <div class="sidebar-avatar group">${initial}</div>
            <div class="sidebar-info">
              <strong>${this.escape(group.name)}</strong>
              <small>${lastMessage || `${members} thành viên`}</small>
            </div>
          </div>
        `;
      });
    }

    if (!html) {
      html = `
        <div class="empty-state">
          <div class="empty-state-icon">💬</div>
          <h3>Chưa có cuộc trò chuyện</h3>
          <p>Thêm bạn bè hoặc tạo nhóm để bắt đầu</p>
        </div>
      `;
    }

    this.sidebarContent.innerHTML = html;

    // Add event listeners
    this.sidebarContent.querySelectorAll("[data-friend-id]").forEach((el) => {
      el.addEventListener("click", () => {
        this.onStartDirect(el.dataset.friendId);
      });
    });

    this.sidebarContent.querySelectorAll("[data-room-id]").forEach((el) => {
      el.addEventListener("click", () => this.onSelectRoom(el.dataset.roomId));
    });
  }

  renderFriendsList(state) {
    if (!state.friends || state.friends.length === 0) {
      this.sidebarContent.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">👥</div>
          <h3>Chưa có bạn bè</h3>
          <p>Thêm bạn bè để bắt đầu trò chuyện</p>
        </div>
      `;
      return;
    }

    const items = state.friends.map((friend) => {
      const initial = (
        friend.display_name ||
        friend.displayName ||
        friend.phone ||
        "U"
      )
        .charAt(0)
        .toUpperCase();
      const isOnline = this.store.isUserOnline(friend.id);
      const name = friend.display_name || friend.displayName || friend.phone;
      const avatarUrl = friend.avatar_url || friend.avatarUrl;

      // Find if there's an existing direct room with this friend
      const directRoom = state.rooms
        ? state.rooms.find(
            (r) => !r.is_group && r.members && r.members.includes(friend.id)
          )
        : null;
      const isActive = directRoom && state.currentRoomId === directRoom.id;

      // Avatar content: image or initial
      const avatarContent = avatarUrl
        ? `<img src="${avatarUrl}" alt="${this.escape(
            name
          )}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
        : initial;

      return `
        <div class="sidebar-item ${isActive ? "active" : ""}" data-friend-id="${
        friend.id
      }">
          <div class="sidebar-avatar ${
            isOnline ? "online" : "offline"
          }">${avatarContent}</div>
          <div class="sidebar-info">
            <strong>${this.escape(name)}</strong>
            <small class="status-text">${
              isOnline ? "Trực tuyến" : "Ngoại tuyến"
            }</small>
          </div>
          <div class="online-indicator ${
            isOnline ? "online" : "offline"
          }"></div>
        </div>
      `;
    });

    this.sidebarContent.innerHTML = items.join("");
    this.sidebarContent.querySelectorAll("[data-friend-id]").forEach((el) => {
      el.addEventListener("click", () => {
        this.onStartDirect(el.dataset.friendId);
      });
    });
  }
}
