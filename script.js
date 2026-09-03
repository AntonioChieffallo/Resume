// DOM Elements
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');
const contactForm = document.querySelector('.contact-form');

// Mobile Navigation Toggle
navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Active Navigation Link Highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            // Remove active class from all nav links
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // Add active class to current section's nav link
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
});

// Form Submission with Formspree
contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = this.querySelector('input[name="name"]').value;
    const email = this.querySelector('input[name="email"]').value;
    const subject = this.querySelector('input[name="subject"]').value;
    const message = this.querySelector('textarea[name="message"]').value;
    
    // Simple form validation
    if (!name || !email || !subject || !message) {
        showErrorGame('Please fill in all fields before sending your message.');
        return;
    }
    
    if (!isValidEmail(email)) {
        showErrorGame('Please enter a valid email address before sending your message.');
        return;
    }
    
    // Show sending message
    showNotification('Sending message...', 'info');
    
    try {
        const response = await fetch(this.action, {
            method: 'POST',
            body: new FormData(this),
            headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Form submission failed with status ${response.status}`);
        }

        window.location.href = this.querySelector('input[name="_next"]').value;
    } catch (error) {
        console.error(error);
        showErrorGame('The message could not be sent right now. Your form is still here to try again.');
    }
});

// Keep unexpected page errors recoverable instead of leaving visitors at a dead end.
window.addEventListener('error', event => {
    showErrorGame('Something unexpected happened while loading this page.');
});

window.addEventListener('unhandledrejection', () => {
    showErrorGame('Something unexpected happened while processing that action.');
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

function showErrorGame(message) {
    const existingGame = document.querySelector('.error-game-overlay');
    if (existingGame) {
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'error-game-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'error-game-title');
    overlay.innerHTML = `
        <div class="error-game" tabindex="-1">
            <button class="error-game-close" type="button" aria-label="Close error game">&times;</button>
            <p class="error-game-kicker">A wild error appeared</p>
            <h2 id="error-game-title">Catch the bugs</h2>
            <p class="error-game-message"></p>
            <div class="error-game-score">Bugs caught: <strong>0</strong> / 5</div>
            <div class="error-game-board" aria-label="Game board">
                <button class="bug-target" type="button" aria-label="Catch bug">&#128027;</button>
            </div>
            <p class="error-game-status" aria-live="polite">Click the bug five times to debug the page.</p>
            <button class="btn btn-secondary error-game-refresh" type="button">Refresh page</button>
        </div>
    `;

    document.body.appendChild(overlay);
    const game = overlay.querySelector('.error-game');
    const target = overlay.querySelector('.bug-target');
    const score = overlay.querySelector('.error-game-score strong');
    const status = overlay.querySelector('.error-game-status');
    const messageElement = overlay.querySelector('.error-game-message');
    let bugsCaught = 0;

    messageElement.textContent = message;
    game.focus();

    target.addEventListener('click', () => {
        bugsCaught += 1;
        score.textContent = bugsCaught;

        if (bugsCaught === 5) {
            status.textContent = 'Nice work. The page is ready for another try.';
            target.disabled = true;
            return;
        }

        const board = overlay.querySelector('.error-game-board');
        target.style.left = `${Math.random() * (board.clientWidth - 48)}px`;
        target.style.top = `${Math.random() * (board.clientHeight - 48)}px`;
        status.textContent = bugsCaught === 4 ? 'One more!' : 'Got it!';
    });

    overlay.querySelector('.error-game-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.error-game-refresh').addEventListener('click', () => window.location.reload());
}

// Simple page ready function
document.addEventListener('DOMContentLoaded', () => {
    console.log('Website loaded successfully!');
});

// Simple scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}