export class ChatPanel {
    constructor({ store, http, wsClient, callModal }) {
      this.store = store;
      this.http = http;
      this.wsClient = wsClient;
      this.callModal = callModal;
      this.loadedRooms = new Set();
      this.cursors = {};
      this.root = document.createElement('div');
      this.root.className = 'chat-panel';
      this.root.innerHTML = this.getTemplate();
      this.messageList = this.root.querySelector('[data-message-list]');
      this.messageForm = this.root.querySelector('[data-message-form]');
      this.messageInput = this.root.querySelector('[data-message-input]');
      this.typingEl = this.root.querySelector('[data-typing]');
      this.fileInput = this.root.querySelector('[data-file-input]');
      this.callButton = this.root.querySelector('[data-call]');
      this.infoButton = this.root.querySelector('[data-info]');
      this.chatName = this.root.querySelector('[data-chat-name]');
      this.chatStatus = this.root.querySelector('[data-chat-status]');
      this.chatAvatar = this.root.querySelector('[data-chat-avatar]');
      this.typingTimer = null;
      this.bindEvents();
      this.unsubscribe = this.store.subscribe((state) => this.render(state));
    }
    bindEvents() {
        this.messageForm.addEventListener('submit', (event) => {
          event.preventDefault();
          const text = this.messageInput.value.trim();
          const { currentRoomId } = this.store.getState();
          if (!text || !currentRoomId) return;
          this.wsClient.sendMessage(currentRoomId, text);
          this.messageInput.value = '';
          this.wsClient.sendTyping(currentRoomId, false);
        });
    
        this.messageInput.addEventListener('input', () => {
          const { currentRoomId } = this.store.getState();
          if (!currentRoomId) return;
          clearTimeout(this.typingTimer);
          this.wsClient.sendTyping(currentRoomId, true);
          this.typingTimer = setTimeout(() => this.wsClient.sendTyping(currentRoomId, false), 2000);
        });
    
        // Scroll to load more
        this.messageList.addEventListener('scroll', () => {
          if (this.messageList.scrollTop === 0) {
            const { currentRoomId } = this.store.getState();
            if (currentRoomId && this.cursors[currentRoomId]) {
              this.loadOlder(currentRoomId);
            }
          }
        });
    
        this.fileInput.addEventListener('change', async () => {
          const file = this.fileInput.files[0];
          const { currentRoomId } = this.store.getState();
          if (!file || !currentRoomId) return;
          const data = new FormData();
          data.append('file', file);
          data.append('roomId', currentRoomId);
          try {
            await this.http.post('/files/upload', data);
          } catch (err) {
            alert(err.message);
          } finally {
            this.fileInput.value = '';
          }
        });
    
        this.callButton.addEventListener('click', () => {
          const { currentRoomId } = this.store.getState();
          if (currentRoomId) {
            this.callModal.open(currentRoomId);
          }
        });
    
        this.infoButton.addEventListener('click', () => {
          const { currentRoomId } = this.store.getState();
          if (currentRoomId) {
            // TODO: Show room info modal or panel
            alert('Tính năng chi tiết đang được phát triển');
          }
        });
      }
///////////////
  mount(container) {
    container.innerHTML = '';
    container.appendChild(this.root);
    this.render(this.store.getState());
  }

  async ensureHistory(roomId) {
    if (this.loadedRooms.has(roomId)) return;
    
    // Fetch messages from server (includes call history)
    const messages = await this.http.get(`/rooms/${roomId}/messages`);
    
    this.store.setMessages(roomId, messages);
    
    if (messages.length) {
      this.cursors[roomId] = messages[0].createdAt;
    }
    this.loadedRooms.add(roomId);
    this.scrollToBottom();
  }

  loadHistory(roomId, options = {}) {
    if (!roomId) return;
    const execute = () => this.ensureHistory(roomId);
    if (options.defer && typeof window !== 'undefined') {
      const scheduler = window.requestIdleCallback || window.requestAnimationFrame || ((cb) => setTimeout(cb, 16));
      scheduler(execute);
    } else {
      execute();
    }
  }

  async loadOlder(roomId) {
    const before = this.cursors[roomId];
    if (!before) return;
    const older = await this.http.get(`/rooms/${roomId}/messages?before=${before}`);
    if (older.length) {
      this.cursors[roomId] = older[0].createdAt;
      this.store.prependMessages(roomId, older);
    }
  }
}