// Firebase configuration
const firebaseConfig = {
    // Add your Firebase configuration here
    // You can get this from Firebase Console
    apiKey: ${{ secrets.secrets.FIREBASE_API_KEY }},
  authDomain: "textler-6e019.firebaseapp.com",
  projectId: "textler-6e019",
  storageBucket: "textler-6e019.firebasestorage.app",
  messagingSenderId: "739872379154",
  appId: "1:739872379154:web:80419748f0f85c78a963cb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// User management
let userId = localStorage.getItem('userId');
let username = localStorage.getItem('username');

if (!userId) {
    userId = Math.floor(Math.random() * 1000000).toString();
    localStorage.setItem('userId', userId);
    username = `@${userId}`;
    localStorage.setItem('username', username);
}

document.getElementById('usernameDisplay').textContent = `Your username: ${username}`;

// Load posts
let lastDoc = null;
let loading = false;

async function loadPosts() {
    if (loading) return;
    loading = true;

    const postsContainer = document.getElementById('postsContainer');
    let query = db.collection('posts')
        .orderBy('timestamp', 'desc')
        .limit(10);

    if (lastDoc) {
        query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    lastDoc = snapshot.docs[snapshot.docs.length - 1];

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.privacy === 'followers' && data.userId !== userId) return;
        
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        
        const displayName = data.privacy === 'anonymous' ? 'Anonymous' : data.username;
        
        postDiv.innerHTML = `
            <p>${data.content}</p>
            <div class="post-actions">
                <button class="like-btn" onclick="likePost('${doc.id}', ${data.likes || 0})">
                    Like (${data.likes || 0})
                </button>
                <button class="share-btn" onclick="sharePost('${doc.id}')">Share</button>
            </div>
            <span class="profile-name">${displayName}</span>
        `;
        postsContainer.appendChild(postDiv);
    });

    loading = false;
}

// Create new post
async function createPost() {
    const content = document.getElementById('postContent').value;
    const privacy = document.getElementById('privacy').value;

    if (!content) return;

    await db.collection('posts').add({
        content,
        userId,
        username,
        privacy,
        likes: 0,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById('postContent').value = '';
    document.getElementById('postsContainer').innerHTML = '';
    lastDoc = null;
    loadPosts();
}

// Update username
async function updateUsername() {
    const newUsername = `@${document.getElementById('usernameInput').value}`;
    if (!newUsername || newUsername === username) return;

    username = newUsername;
    localStorage.setItem('username', username);
    document.getElementById('usernameDisplay').textContent = `Your username: ${username}`;
    document.getElementById('usernameInput').value = '';
}

// Like post
async function likePost(postId, currentLikes) {
    await db.collection('posts').doc(postId).update({
        likes: currentLikes + 1
    });
    document.getElementById('postsContainer').innerHTML = '';
    lastDoc = null;
    loadPosts();
}

// Share post (simple alert for demo)
function sharePost(postId) {
    alert(`Sharing post ${postId}! In a full implementation, this would generate a shareable link.`);
}

// Infinite scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadPosts();
    }
});

// Initial load
loadPosts();
