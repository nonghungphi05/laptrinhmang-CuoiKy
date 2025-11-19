import { Store } from "../core/store.js";
import { HttpClient } from "../core/httpClient.js";
import { WsClient } from "../core/wsClient.js";
import { RtcClient } from "../core/rtcClient.js";
import { renderAuthPage } from "../features/auth/authPage.js";
import { ChatPanel } from "../features/chat/chatPanel.js";
import { ProfilePanel } from "../features/profile/profilePanel.js";
import { FriendPanel } from "../features/friends/friendPanel.js";
import { AppShell } from "./shell.js";
import { CallModal } from "../features/call/callModal.js";
import { GroupPanel } from "../features/groups/groupPanel.js";
import { SettingsPanel } from "../features/settings/settingsPanel.js";
import { IncomingCallNotification } from "../features/call/incomingCallNotification.js";

const DATA_CACHE_KEY = "messzola_cache_v1";
const DATA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const appMount = document.getElementById("app");
const callRoot = document.getElementById("call-root");
const incomingCallRoot = document.getElementById("incoming-call-root");

const store = new Store();
const http = new HttpClient("/api");
const wsClient = new WsClient({ store });
const rtcClient = new RtcClient({ store, wsClient });
const callModal = new CallModal({ mount: callRoot, rtcClient, store });
