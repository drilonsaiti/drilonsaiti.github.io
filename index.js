document.addEventListener("DOMContentLoaded", function() {
    const projects = document.querySelectorAll(".projects-item");
    const prevBtn = document.querySelector(".btn-carousel.btn--left");
    const nextBtn = document.querySelector(".btn-carousel.btn--right");
    const dots = document.querySelectorAll(".dot");
    let currentIndex = 0;

    prevBtn.addEventListener("click", function() {
        projects[currentIndex].classList.remove("active", "slide-animation","slide-animation-left","slide-animation-right");
        currentIndex = (currentIndex - 1 + projects.length) % projects.length;
        setTimeout(() => {
            projects[currentIndex].classList.add("active");
            projects[currentIndex].classList.add("slide-animation-right");
        }, 50);
        updateCarousel();
    });

    nextBtn.addEventListener("click", function() {
        projects[currentIndex].classList.remove("active", "slide-animation","slide-animation-left","slide-animation-right");
        currentIndex = (currentIndex + 1) % projects.length;

        setTimeout(() => {
            projects[currentIndex].classList.add("active");
            projects[currentIndex].classList.add("slide-animation-left");
        }, 50);
        updateCarousel();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", function() {
            projects[currentIndex].classList.remove("active", "slide-animation");
            currentIndex = index;
            projects[currentIndex].classList.add("active");
            setTimeout(() => {
                projects[currentIndex].classList.add("slide-animation");
            }, 50);
            updateCarousel();
        });
    });

    function updateCarousel() {
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add("dot--fill");
            } else {
                dot.classList.remove("dot--fill");
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const backToTopBtn = document.querySelector('.back-to-top');


    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.section');

    function checkScroll() {
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (sectionTop < windowHeight * 0.75) {
                section.classList.add('animated');
            }else{
                section.classList.remove('animated');
            }
        });
    }

    window.addEventListener('scroll', checkScroll);
   window.addEventListener('resize', checkScroll);

    checkScroll();

});

document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('.footer');
    let isAnimating = false;

    function checkFooter() {
        if (isAnimating) return;

        const windowHeight = window.innerHeight;
        const bodyHeight = document.body.clientHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop + windowHeight >= bodyHeight - footer.offsetHeight) {
            footer.classList.add('animated');
            isAnimating = true;
        }
    }

    function debounce(func, wait = 20, immediate = true) {
        let timeout;
        return function() {
            let context = this, args = arguments;
            let later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    const debouncedCheckFooter = debounce(checkFooter);

    window.addEventListener('scroll', debouncedCheckFooter);
    window.addEventListener('resize', debouncedCheckFooter);

    checkFooter();

});


document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth',block: 'center' });
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const aboutSection = document.querySelector('.about');
    let aboutSectionOffset = aboutSection.offsetTop;

    function checkScroll() {
        let windowHeight = window.innerHeight;
        let scrollTop = window.scrollY;

        if (scrollTop + windowHeight > aboutSectionOffset) {
            aboutSection.classList.add('animated');
        }
    }

    checkScroll();

    window.addEventListener('scroll', checkScroll);
});

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (currentScroll > lastScrollTop) {
            header.classList.add('animated');
        } else {
            header.classList.remove('animated');
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
});


document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("contactModal");
    const btn = document.getElementById("contactBtn");
    const btnEmail = document.getElementById("contactBtnIcon");
    const span = document.getElementsByClassName("close")[0];
    const close = document.getElementById("close")
    btn.onclick = function() {
        modal.style.display = "block";
    }

    btnEmail.onclick = function (){
        modal.style.display = "block";

    }
    span.onclick = function() {
        modal.style.display = "none";
    }

    close.onclick = function (){
        modal.style.display = "none";

    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

});
document.getElementById('close').addEventListener('click', function() {
    document.getElementById('contactModal').style.display = 'none';
});

document.getElementById('contactBtns').addEventListener('click', function() {
    const recipientEmail = 'drilon-saiti@hotmail.com';
    const fullName = document.getElementById('fullName').value;
    const companyName = document.getElementById('companyName').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    let body = 'Name: ' + fullName + '\n';
    if (companyName) {
        body += 'Company Name: ' + companyName + '\n';
    }
    body += 'Email: ' + email + '\n';
    body += 'Message: ' + message;

    let subject;
    if (companyName) {
        subject = 'Company ' + companyName + ' wants to contact with you, ';
    } else {
        subject = 'New Message from ' + fullName + ' (No company provided)';
    }

    var mailtoLink = 'mailto:' + recipientEmail +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

    window.location.href = mailtoLink;
});

document.addEventListener('DOMContentLoaded', function() {

    const themeToggle = document.getElementById('themeToggle');
    const container = document.querySelector('.container');
    const moon = document.querySelector('.fa-moon');
    const sun = document.querySelector('.fa-sun');

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        container.classList.add(currentTheme);
        if (currentTheme === 'dark-mode'){
            moon.style.display = 'none';
            sun.style.display = 'block'

        }else{
            sun.style.display = 'none'
            moon.style.display = 'block';
        }
    }else{
        container.classList.add('light-mode');
        localStorage.setItem('theme', 'light-mode');
        sun.style.display = 'none'
        moon.style.display = 'block';
    }

    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            container.classList.remove('light-mode');
            container.classList.add('dark-mode');
            sun.style.display = 'block'
            moon.style.display = 'none';
            localStorage.setItem('theme', 'dark-mode');
        } else {
            container.classList.remove('dark-mode');
            container.classList.add('light-mode');
            sun.style.display = 'none'
            moon.style.display = 'block';
            localStorage.setItem('theme', 'light-mode');
        }
    });
});
