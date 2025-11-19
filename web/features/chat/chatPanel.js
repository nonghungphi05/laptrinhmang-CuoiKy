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
    
}