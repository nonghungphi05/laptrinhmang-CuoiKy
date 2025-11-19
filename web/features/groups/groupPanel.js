export class GroupPanel {
  constructor({ store, http, onSelectRoom }) {
    this.store = store;
    this.http = http;
    this.onSelectRoom = onSelectRoom;
    this.root = document.createElement('div');
    this.root.className = 'group-panel';
    this.root.innerHTML = this.getTemplate();
    this.createGroupForm = this.root.querySelector('[data-create-group-form]');
    this.groupNameInput = this.root.querySelector('[data-group-name]');
    this.friendCheckboxes = this.root.querySelector('[data-group-friends]');
    this.groupsList = this.root.querySelector('[data-groups-list]');
    this.inviteDialog = null;
    this.latestState = null;
    this.bindEvents();
    this.unsubscribe = this.store.subscribe((state) => this.render(state));
  }

  bindEvents() {
    this.createGroupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = this.groupNameInput.value.trim();
      const checkboxes = this.friendCheckboxes.querySelectorAll('input[type="checkbox"]:checked');
      const memberIds = Array.from(checkboxes).map(cb => cb.value);
      
      if (!name || memberIds.length === 0) {
        alert('Vui lòng nhập tên nhóm và chọn ít nhất 1 thành viên');
        return;
      }
      
      const submitBtn = this.createGroupForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang tạo...';
      
      try {
        await this.http.post('/rooms/group', { name, memberIds });
        this.groupNameInput.value = '';
        checkboxes.forEach(cb => cb.checked = false);
        await this.reloadRooms();
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = '✓ Tạo nhóm thành công!';
        this.createGroupForm.insertAdjacentElement('afterend', successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      } catch (err) {
        alert(err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  formatRooms(rooms) {
    return rooms.map((room) => ({
      ...room,
      members: room.members || '',
      is_group: Number(room.is_group)
    }));
  }

  async reloadRooms() {
    const rooms = await this.http.get('/rooms');
    this.store.setRooms(this.formatRooms(rooms));
  }
}
export class GroupPanel {
  mount(container) {
    container.innerHTML = '';
    container.appendChild(this.root);
    this.render(this.store.getState());
  }

  render(state) {
    this.latestState = state;
    if (state.view !== 'groups') {
      this.root.style.display = 'none';
      this.closeInviteDialog();
      return;
    }
    this.root.style.display = 'block';
    
    this.renderFriendCheckboxes(state.friends || []);
    this.renderGroupsList(state);
  }

  renderFriendCheckboxes(friends) {
    if (friends.length === 0) {
      this.friendCheckboxes.innerHTML = '<p style="color: var(--color-muted); text-align: center;">Chưa có bạn bè để tạo nhóm</p>';
      return;
    }
    
    this.friendCheckboxes.innerHTML = friends.map(friend => {
      const name = friend.display_name || friend.displayName || friend.phone;
      return `
        <label>
          <input type="checkbox" value="${friend.id}" />
          <span>${this.escape(name)}</span>
        </label>
      `;
    }).join('');
  }

  renderGroupsList(state) {
    const groups = state.rooms ? state.rooms.filter(r => r.is_group) : [];
    
    if (groups.length === 0) {
      this.groupsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">👨‍👩‍👧‍👦</div>
          <h3>Chưa có nhóm</h3>
          <p>Tạo nhóm mới ở phía trên để bắt đầu</p>
        </div>
      `;
      return;
    }
    
    this.groupsList.innerHTML = groups.map(group => {
      const members = group.members ? group.members.split(',').length : 0;
      const initial = group.name.charAt(0).toUpperCase();
      const isOwner = group.owner_id === state.user?.id;
      const actionButtons = isOwner
        ? `<div class="group-actions">
             <button class="remove-group-btn" data-invite-group="${group.id}" title="Mời thêm thành viên">＋</button>
             <button class="remove-group-btn" data-disband-group="${group.id}" title="Giải tán nhóm">🗑</button>
           </div>`
        : `<button class="remove-group-btn" data-leave-group="${group.id}" title="Rời nhóm">×</button>`;
      
      return `
        <div class="group-card" data-group-id="${group.id}">
          <div class="group-avatar">${initial}</div>
          <div class="group-info">
            <strong>${this.escape(group.name)}</strong>
            <small>${members} thành viên${isOwner ? ' • Chủ nhóm' : ''}</small>
          </div>
          ${actionButtons}
        </div>
      `;
    }).join('');
    
    this.groupsList.querySelectorAll('.group-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-group-btn')) {
          return;
        }
        const groupId = card.dataset.groupId;
        if (this.onSelectRoom) {
          this.onSelectRoom(groupId);
          this.store.setView('chat');
        }
      });
    });
  }
}