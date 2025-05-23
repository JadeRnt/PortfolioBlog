
function showNotification(message) {
  let bar = document.getElementById("notif-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "notif-bar";
    bar.style.position = "fixed";
    bar.style.top = "55px";
    bar.style.left = "calc(50% - 200px)";
    bar.style.width = "400px";
    bar.style.padding = "10px";
    bar.style.backgroundColor = "#333";
    bar.style.color = "white";
    bar.style.textAlign = "center";
    bar.style.zIndex = "9999";
    bar.style.fontFamily = "monospace";
    bar.style.border = "2px solid gold";
    bar.style.borderRadius = "8px";
    bar.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
    document.body.appendChild(bar);
  }
  bar.textContent = message;
  setTimeout(() => { if (bar) bar.remove(); }, 4000);
}


function showNotification_OLD(message) {
  let bar = document.getElementById("notif-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "notif-bar";
    bar.style.position = "fixed";
    bar.style.top = "55px"; // sous le header
    bar.style.left = "0";
    bar.style.right = "0";
    bar.style.padding = "10px";
    bar.style.backgroundColor = "#333";
    bar.style.color = "white";
    bar.style.textAlign = "center";
    bar.style.zIndex = "9999";
    bar.style.fontFamily = "monospace";
    bar.style.borderBottom = "2px solid gold";
    bar.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
    document.body.prepend(bar);
  }
  bar.textContent = message;
  setTimeout(() => { if (bar) bar.remove(); }, 4000);
}


function showNotification_OLD_OLD(message) {
  let bar = document.getElementById("notif-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "notif-bar";
    bar.style.position = "fixed";
    bar.style.top = "0";
    bar.style.left = "0";
    bar.style.right = "0";
    bar.style.padding = "10px";
    bar.style.backgroundColor = "#222";
    bar.style.color = "white";
    bar.style.textAlign = "center";
    bar.style.zIndex = "9999";
    bar.style.fontFamily = "monospace";
    document.body.prepend(bar);
  }
  bar.textContent = message;
}


console.log("JayApp loaded");

document.addEventListener("DOMContentLoaded", () => {
  const storage = {
    users: JSON.parse(localStorage.getItem("users") || "[]"),
    comments: JSON.parse(localStorage.getItem("comments") || "[]"),
    likes: JSON.parse(localStorage.getItem("likes") || "[]")
  };

  let currentUser = null;
  const raw = localStorage.getItem("currentUserData");
  if (raw && raw.trim().startsWith("{")) {
    try {
      const session = JSON.parse(raw);
      if (session && session.timestamp && Date.now() - session.timestamp < 86400000) {
        currentUser = session.user;
      }
    } catch (e) {
      localStorage.removeItem("currentUserData");
    }
  }

  function save() {
    localStorage.setItem("users", JSON.stringify(storage.users));
    localStorage.setItem("comments", JSON.stringify(storage.comments));
    localStorage.setItem("likes", JSON.stringify(storage.likes));
  }

  window.JayApp = {
    currentUser,

    signUp(username, password) {
      if (username.length < 4 || password.length < 4) {
        showNotification("⚠️ Username and password must be at least 4 characters.");
        return;
      }
      if (storage.users.find(u => u.username === username)) {
        showNotification("⚠️ Username already exists!");
        return;
      }
      const newUser = { username, password };
      storage.users.push(newUser);
      save();
      this.currentUser = newUser;
      localStorage.setItem("currentUserData", JSON.stringify({ user: newUser, timestamp: Date.now() }));
      showNotification("✅ Account created and logged in!"); setTimeout(() => window.location.href = 'index.html', 1000);
      this.displayAllComments();
      this.displayAllLikes();
    },

    login(username, password) {
      const user = storage.users.find(u => u.username === username && u.password === password);
      if (user) {
        this.currentUser = user;
        localStorage.setItem("currentUserData", JSON.stringify({ user, timestamp: Date.now() }));
        showNotification("✅ Logged in as " + username); setTimeout(() => window.location.href = 'index.html', 1000);
        this.displayAllComments();
        this.displayAllLikes();
      } else {
        showNotification("❌ Incorrect username or password.");
      }
    },

    logout() {
      this.currentUser = null;
      localStorage.removeItem("currentUserData");
      showNotification("🔓 You have been logged out.");
    },

    like(itemId) {
      if (!this.currentUser) return showNotification("🔒 You must login to like.");
      const index = storage.likes.findIndex(l => l.username === this.currentUser.username && l.itemId === itemId);
      if (index >= 0) {
        storage.likes.splice(index, 1);
      } else {
        storage.likes.push({ username: this.currentUser.username, itemId });
      }
      save();
      this.displayAllLikes();
    },

    comment(itemId, text) {
      if (!this.currentUser) return showNotification("🔒 You must login to comment.");
      
      storage.comments.push({
        username: this.currentUser.username,
        itemId,
        text,
        date: new Date().toLocaleString()
      });
      save();
      this.displayAllComments();
    },

    editComment(itemId) {
      if (!this.currentUser) return alert("Login first.");
      const i = storage.comments.findIndex(
        c => c.itemId === itemId && c.username === this.currentUser.username
      );
      if (i === -1) return alert("You have no comment to edit.");
      

// prompt removed: edit handled inline  // fallback in case JS isn't updated


      if (newText) {
        storage.comments[i].text = newText;
        storage.comments[i].date = new Date().toLocaleString();
        save();
        this.displayAllComments();
      }
    },

    deleteComment(itemId) {
      if (!this.currentUser) return alert("Login first.");
      const i = storage.comments.findIndex(
        c => c.itemId === itemId && c.username === this.currentUser.username
      );
      if (i === -1) return alert("No comment to delete.");
      if (confirm("Are you sure?")) {
        storage.comments.splice(i, 1);
        save();
        this.displayAllComments();
      }
    },

    displayAllComments() {
      document.querySelectorAll(".comments-box").forEach(box => box.innerHTML = "");
      storage.comments.forEach(c => {
        const box = document.querySelector("#comments-" + c.itemId);
        if (box) {
          const p = document.createElement("p");
          

p.innerHTML = `<strong>[${c.username}]</strong> <span class="comment-text" id="text-${c.itemId}">${c.text}</span> <em>(${c.date})</em>`;


          
box.appendChild(p);

if (this.currentUser && !document.getElementById("comment-box-" + c.itemId)) {
  const container = document.createElement("div");
  container.id = "comment-box-" + c.itemId;
  container.style.marginTop = "8px";

  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "➕ Add Comment";
  toggleBtn.onclick = () => {
    input.style.display = input.style.display === "block" ? "none" : "block";
    submitBtn.style.display = input.style.display;
  };

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Write your comment...";
  input.style.display = "none";
  input.style.marginTop = "5px";
  input.id = "comment-input-" + c.itemId;

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.style.marginLeft = "5px";
  submitBtn.style.display = "none";
  submitBtn.onclick = () => JayApp.comment(c.itemId);

  container.appendChild(toggleBtn);
  container.appendChild(input);
  container.appendChild(submitBtn);
  box.appendChild(container);
}

if (this.currentUser && c.username === this.currentUser.username && !document.getElementById("comment-input-" + c.itemId)) {
  const input = document.createElement("input");
  input.id = "comment-input-" + c.itemId;
  input.placeholder = "Write a comment...";
  input.style.display = "block";
  input.style.marginTop = "5px";
  input.onkeydown = e => {
    if (e.key === "Enter") {
      JayApp.comment(c.itemId);
    }
  };
  box.appendChild(input);
}

          if (this.currentUser && c.username === this.currentUser.username) {
            const editBtn = document.createElement("button");
            editBtn.textContent = "✏️";
            

editBtn.onclick = () => {
  const span = document.getElementById("text-" + c.itemId);
  const originalText = span.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = originalText;
  input.style.marginLeft = "8px";
  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      const updated = input.value.trim();
      if (updated) {
        const i = storage.comments.findIndex(x => x.itemId === c.itemId && x.username === c.username && x.text === originalText);
        if (i !== -1) {
          storage.comments[i].text = updated;
          storage.comments[i].date = new Date().toLocaleString();
          save();
          setTimeout(() => JayApp.displayAllComments(), 100);
        }
      }
    }
  };
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.marginLeft = "5px";
  cancelBtn.onclick = () => {
    input.replaceWith(span);
    cancelBtn.remove();
  };
  span.replaceWith(input);
  input.after(cancelBtn);
  input.focus();
  input.focus();

  if (newText && newText.trim()) {
    const i = storage.comments.findIndex(x => x.itemId === c.itemId && x.username === c.username && x.text === c.text);
    if (i !== -1) {
      storage.comments[i].text = newText.trim();
      storage.comments[i].date = new Date().toLocaleString();
      save();
      setTimeout(() => JayApp.displayAllComments(), 100);
    }
  }
};

            p.appendChild(editBtn);
            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => JayApp.deleteComment(c.itemId);
            p.appendChild(delBtn);
          }
        }
      });
    },

    displayAllLikes() {
      document.querySelectorAll(".like-count").forEach(span => {
        const itemId = span.dataset.item;
        const count = storage.likes.filter(l => l.itemId === itemId).length;
        span.textContent = "❤️ " + count;
      });
    },

    getUser() {
      return this.currentUser;
    }
  };

  setTimeout(() => JayApp.displayAllComments(), 100); JayApp.displayAllLikes();
  JayApp.displayAllLikes();
});
