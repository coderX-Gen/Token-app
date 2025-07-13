// index.html

if (document.querySelector('#registerForm')) {
  document.querySelector('#registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    let res = await fetch('/api/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    let json = await res.json();
    if (json.success) window.location = 'dashboard.html';
  });
}

if (document.querySelector('#loginForm')) {
  document.querySelector('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    let res = await fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    let json = await res.json();
    if (json.success) window.location = 'dashboard.html';
    else alert(json.message);
  });
}

// dashboard.html

if (document.querySelector('#welcome')) {
  fetch('/api/user')
    .then(res => res.json())
    .then(data => {
      if (!data.loggedIn) {
        window.location = 'index.html';
        return;
      }
      document.querySelector('#welcome').textContent = `Hello, ${data.username}!`;
      document.querySelector('#tokenCount').textContent = data.tokens;

      let receivedList = document.querySelector('#receivedList');
      data.received.forEach(item => {
        let li = document.createElement('li');
        li.textContent = `${item.from} sent ${item.tokens} tokens for "${item.message}"`;
        receivedList.appendChild(li);
      });
    });

  document.querySelector('#sendForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.tokens = Number(data.tokens);
    let res = await fetch('/api/send', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    let json = await res.json();
    if (json.success) {
      alert('Tokens sent!');
      window.location.reload();
    } else {
      alert(json.message);
    }
  });

  document.querySelector('#earnBtn').addEventListener('click', () => {
    window.location = 'game.html';
  });

  document.querySelector('#logoutBtn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location = 'index.html';
  });
}

// game.html
if (document.querySelector('#playBtn')) {
  document.querySelector('#playBtn').addEventListener('click', async () => {
    let res = await fetch('/api/earn', {
      method: 'POST'
    });
    let json = await res.json();
    alert(`You earned tokens! Your balance is now ${json.tokens}.`);
    window.location = 'dashboard.html';
  });
                                                        }
