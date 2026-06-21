const PROFILE_SERVICE_URL = 'http://localhost:3001';

window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    document.getElementById('status').textContent = 'Не авторизован';
    document.getElementById('status').style.color = 'red';
    return;
  }
  try {
    const res = await fetch('/api/verify', { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (data.valid) {
      document.getElementById('status').textContent = 'Авторизован';
      document.getElementById('status').style.color = 'green';
      document.getElementById('userId').textContent = data.user.userId;
      document.getElementById('userEmail').textContent = data.user.email;
    } else {
      document.getElementById('status').textContent = 'Токен невалиден';
      document.getElementById('status').style.color = 'red';
      localStorage.removeItem('token');
    }
  } catch (err) { document.getElementById('status').textContent = 'Ошибка проверки'; }
});

async function createProfile() {
  const token = localStorage.getItem('token');
  const displayName = document.getElementById('displayName').value;
  const bio = document.getElementById('bio').value;
  if (!token) { alert('Сначала войдите в систему!'); return; }
  try {
    const res = await fetch(`${PROFILE_SERVICE_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ displayName, bio })
    });
    const data = await res.json();
    const resultDiv = document.getElementById('profileResult');
    if (res.ok) resultDiv.innerHTML = `<p style="color: green;">Профиль создан! ID: ${data.profile.id}</p>`;
    else resultDiv.innerHTML = `<p style="color: red;">Ошибка: ${data.error}</p>`;
  } catch (err) {
    document.getElementById('profileResult').innerHTML = '<p style="color: red;">Ошибка соединения с Profile Service</p>';
  }
}