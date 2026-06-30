document.addEventListener('DOMContentLoaded', () => {
    // --- Toast Notification System ---
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="#10b981" stroke-width="2.5" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="#ef4444" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        } else {
            iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="#0ea5e9" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        }

        toast.innerHTML = `
            <div class="toast-icon">${iconSvg}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" aria-label="Close">&times;</button>
        `;

        toastContainer.appendChild(toast);

        // Slide in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto remove
        const autoRemoveTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 350);
        }, 4000);

        // Close button click
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(autoRemoveTimeout);
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 350);
        });
    };

    window.showToast = showToast; // Expose globally for convenience

    // --- Sticky Header ---
    const header = document.getElementById('siteHeader');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Hero Slideshow ---
    const heroSection = document.getElementById('homeHero');
    const heroPrevBtn = document.getElementById('heroPrevBtn');
    const heroNextBtn = document.getElementById('heroNextBtn');
    
    if (heroSection && heroPrevBtn && heroNextBtn) {
        const slides = [
            '/static/images/hero_bottles_new.jpg',
            '/static/images/home_bottles.jpg',
            '/static/images/home_preforms.jpg'
        ];
        let currentSlide = 0;
        let slideInterval;
        
        const changeSlide = (index) => {
            currentSlide = index;
            // Smooth fade transition
            heroSection.style.transition = 'opacity 0.25s ease-in-out';
            heroSection.style.opacity = '0.75';
            setTimeout(() => {
                heroSection.style.backgroundImage = `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.45)), url('${slides[currentSlide]}')`;
                heroSection.style.opacity = '1';
            }, 250);
        };
        
        const nextSlide = () => {
            let nextIndex = currentSlide + 1;
            if (nextIndex >= slides.length) nextIndex = 0;
            changeSlide(nextIndex);
        };
        
        const prevSlide = () => {
            let prevIndex = currentSlide - 1;
            if (prevIndex < 0) prevIndex = slides.length - 1;
            changeSlide(prevIndex);
        };
        
        const startAutoSlide = () => {
            stopAutoSlide();
            slideInterval = setInterval(nextSlide, 5000); // Auto-slide every 5 seconds
        };
        
        const stopAutoSlide = () => {
            if (slideInterval) clearInterval(slideInterval);
        };
        
        heroNextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide(); // Reset auto-slide timer
        });
        
        heroPrevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide(); // Reset auto-slide timer
        });
        
        // Start automatic sliding
        startAutoSlide();
        
        // Pause auto-sliding on hover
        heroSection.addEventListener('mouseenter', stopAutoSlide);
        heroSection.addEventListener('mouseleave', startAutoSlide);
    }

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const paths = menuToggle.querySelectorAll('path');
            if (mainNav.classList.contains('active')) {
                paths[0].setAttribute('d', 'M6 18L18 6M6 6l12 12');
            } else {
                paths[0].setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
            }
        });
    }

    // --- Scroll Animations (Reveal on Scroll) ---
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < triggerBottom) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // --- Product Filtering (products.html) ---
    const filterTabs = document.querySelectorAll('.filter-tab');
    const productCards = document.querySelectorAll('.product-card');
    if (filterTabs.length > 0 && productCards.length > 0) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const filterValue = tab.getAttribute('data-filter');

                productCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (filterValue === 'all' || cardCategory === filterValue) {
                        card.classList.remove('hidden');
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                            card.style.transition = 'all 0.3s ease';
                        }, 50);
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    // --- Accordion for FAQs (contact.html) ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const isActive = item.classList.contains('active');
                
                document.querySelectorAll('.accordion-item').forEach(i => {
                    i.classList.remove('active');
                    const content = i.querySelector('.accordion-content');
                    content.style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('active');
                    const content = item.querySelector('.accordion-content');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });
    }

    // --- Contact Location Tabs (contact.html) ---
    const locationTabs = document.querySelectorAll('.location-tab');
    const locationContents = document.querySelectorAll('.location-content');
    if (locationTabs.length > 0 && locationContents.length > 0) {
        locationTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-target');

                locationTabs.forEach(t => t.classList.remove('active'));
                locationContents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // --- RFQ Form Handler (AJAX integration) ---
    const rfqForm = document.getElementById('rfqForm');
    const formStatus = document.getElementById('formStatus');
    if (rfqForm && formStatus) {
        rfqForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('fullName').value.trim();
            const email = document.getElementById('emailAddress').value.trim();
            const phone = document.getElementById('phoneNumber').value.trim();
            const message = document.getElementById('messageText').value.trim();
            const whatsapp = document.getElementById('whatsappConsent').checked;

            if (!name || !email || !phone) {
                formStatus.style.display = 'block';
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Please fill out all required fields marked with (*).';
                formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                formStatus.style.display = 'block';
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Please enter a valid email address.';
                formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            const submitBtn = document.getElementById('submitBtn');
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting Request...';

            // Send actual AJAX post request to Django API
            fetch('/api/rfq/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: name,
                    emailAddress: email,
                    phoneNumber: phone,
                    messageText: message,
                    whatsappConsent: whatsapp
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    formStatus.style.display = 'none';
                    rfqForm.reset();

                    // Open Success Modal
                    const rfqSuccessModal = document.getElementById('rfqSuccessModal');
                    const successModalMessage = document.getElementById('successModalMessage');
                    if (rfqSuccessModal && successModalMessage) {
                        successModalMessage.textContent = data.message;
                        rfqSuccessModal.style.display = 'flex';
                        rfqSuccessModal.offsetHeight; // force reflow
                        rfqSuccessModal.classList.add('show');
                        rfqSuccessModal.setAttribute('aria-hidden', 'false');

                        // Set up close event handlers
                        const closeSuccessModal = document.getElementById('closeSuccessModal');
                        const successOkBtn = document.getElementById('successOkBtn');
                        
                        const closeSuccess = () => {
                            rfqSuccessModal.classList.remove('show');
                            rfqSuccessModal.setAttribute('aria-hidden', 'true');
                            setTimeout(() => {
                                rfqSuccessModal.style.display = 'none';
                            }, 300);
                        };

                        if (closeSuccessModal) closeSuccessModal.onclick = closeSuccess;
                        if (successOkBtn) successOkBtn.onclick = closeSuccess;
                        
                        rfqSuccessModal.onclick = (event) => {
                            if (event.target === rfqSuccessModal) {
                                closeSuccess();
                            }
                        };
                    }
                } else {
                    formStatus.style.display = 'block';
                    formStatus.className = 'form-status error';
                    formStatus.textContent = data.message || 'Submission failed. Please check inputs.';
                    formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            })
            .catch(error => {
                console.error('Error submitting RFQ:', error);
                formStatus.style.display = 'block';
                formStatus.className = 'form-status error';
                formStatus.textContent = 'A network error occurred. Please try again later.';
                formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            });
        });
    }

    // --- Admin Dashboard Row Expansion ---
    const expandButtons = document.querySelectorAll('.expand-btn');
    if (expandButtons.length > 0) {
        expandButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const detailRow = document.getElementById(targetId);
                const isHidden = detailRow.style.display === 'none';

                // Close all open rows
                document.querySelectorAll('.quote-details-row').forEach(row => {
                    row.style.display = 'none';
                });
                document.querySelectorAll('.expand-btn').forEach(b => {
                    const icon = b.querySelector('svg');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });

                if (isHidden) {
                    detailRow.style.display = 'table-row';
                    const icon = btn.querySelector('svg');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                }
            });
        });
    }

    // --- Admin Dashboard Search Filtering ---
    const adminSearchInput = document.getElementById('adminSearch');
    const submissionRows = document.querySelectorAll('.submission-item-row');
    if (adminSearchInput && submissionRows.length > 0) {
        adminSearchInput.addEventListener('input', () => {
            const query = adminSearchInput.value.toLowerCase().trim();

            submissionRows.forEach(row => {
                const textContent = row.textContent.toLowerCase();
                const detailId = row.querySelector('.expand-btn').getAttribute('data-target');
                const detailRow = document.getElementById(detailId);

                if (textContent.includes(query)) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                    if (detailRow) detailRow.style.display = 'none';
                }
            });
        });
    }

    // --- Review Modal Logic ---
    const reviewModal = document.getElementById('reviewModal');
    const reviewBtn = document.getElementById('headerPortalBtn');
    const closeReviewBtn = document.getElementById('closeReviewModal');
    
    if (reviewModal && reviewBtn) {
        reviewBtn.addEventListener('click', (e) => {
            // Only trigger modal if this is the "Review" button (href has javascript:void(0) or similar)
            if (reviewBtn.getAttribute('href') === 'javascript:void(0)') {
                e.preventDefault();
                reviewModal.style.display = 'flex';
                // Trigger reflow for transition
                reviewModal.offsetHeight; 
                reviewModal.classList.add('show');
                reviewModal.setAttribute('aria-hidden', 'false');
            }
        });

        const closeModal = () => {
            reviewModal.classList.remove('show');
            reviewModal.setAttribute('aria-hidden', 'true');
            setTimeout(() => {
                reviewModal.style.display = 'none';
                // Reset elements back to default form state when closing
                const modalTitle = reviewModal.querySelector('#modalTitle');
                const modalDesc = reviewModal.querySelector('.review-modal-content > p');
                const modalForm = reviewModal.querySelector('#reviewForm');
                const successState = reviewModal.querySelector('.review-success-state');
                
                if (modalTitle) modalTitle.style.display = '';
                if (modalDesc) modalDesc.style.display = '';
                if (modalForm) modalForm.style.display = '';
                if (successState) successState.style.display = 'none';
            }, 300); // match CSS transition duration
        };

        if (closeReviewBtn) {
            closeReviewBtn.addEventListener('click', closeModal);
        }

        window.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                closeModal();
            }
        });

        // --- Interactive Star Rating ---
        const stars = reviewModal.querySelectorAll('.star-rating .star');
        const ratingInput = document.getElementById('revRating');

        if (stars.length > 0 && ratingInput) {
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const rating = parseInt(star.getAttribute('data-rating'));
                    ratingInput.value = rating;
                    
                    // Update active state
                    stars.forEach(s => {
                        const sRating = parseInt(s.getAttribute('data-rating'));
                        if (sRating <= rating) {
                            s.classList.add('active');
                            s.setAttribute('aria-checked', 'true');
                        } else {
                            s.classList.remove('active');
                            s.setAttribute('aria-checked', 'false');
                        }
                    });
                });

                star.addEventListener('mouseenter', () => {
                    const rating = parseInt(star.getAttribute('data-rating'));
                    stars.forEach(s => {
                        const sRating = parseInt(s.getAttribute('data-rating'));
                        if (sRating <= rating) {
                            s.classList.add('hover');
                        } else {
                            s.classList.remove('hover');
                        }
                    });
                });

                star.addEventListener('mouseleave', () => {
                    stars.forEach(s => s.classList.remove('hover'));
                });

                // Keyboard navigation for accessibility
                star.addEventListener('keydown', (e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        star.click();
                    }
                });
            });
        }

        // --- Review Form Submission ---
        const reviewForm = document.getElementById('reviewForm');
        const reviewStatus = document.getElementById('reviewStatus');
        
        if (reviewForm && reviewStatus) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const name = document.getElementById('revName').value.trim();
                const email = document.getElementById('revEmail').value.trim();
                const rating = ratingInput.value;
                const reviewText = document.getElementById('revText').value.trim();

                if (!name || !email || !reviewText) {
                    reviewStatus.className = 'form-status error';
                    reviewStatus.textContent = 'Please fill out all required fields.';
                    reviewStatus.style.display = 'block';
                    return;
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    reviewStatus.className = 'form-status error';
                    reviewStatus.textContent = 'Please enter a valid email address.';
                    reviewStatus.style.display = 'block';
                    return;
                }

                if (rating === '0') {
                    reviewStatus.className = 'form-status error';
                    reviewStatus.textContent = 'Please select a star rating.';
                    reviewStatus.style.display = 'block';
                    return;
                }

                const submitBtn = document.getElementById('submitReviewBtn');
                const originalBtnContent = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Submitting Review...';
                reviewStatus.style.display = 'none';

                fetch('/api/reviews/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fullName: name,
                        emailAddress: email,
                        rating: rating,
                        reviewText: reviewText
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        reviewForm.reset();
                        ratingInput.value = '0';
                        stars.forEach(s => {
                            s.classList.remove('active');
                            s.setAttribute('aria-checked', 'false');
                        });
                        
                        reviewStatus.style.display = 'none';

                        // Display success modal screen dynamically
                        let successState = reviewModal.querySelector('.review-success-state');
                        if (!successState) {
                            successState = document.createElement('div');
                            successState.className = 'review-success-state';
                            successState.style.textAlign = 'center';
                            successState.style.padding = '2rem 0';
                            successState.innerHTML = `
                                <div class="success-icon-wrapper" style="margin-bottom: 1.5rem; display: flex; justify-content: center;">
                                    <svg viewBox="0 0 24 24" width="64" height="64" stroke="#059669" stroke-width="2" fill="none" style="animation: float 4s ease-in-out infinite;">
                                        <circle cx="12" cy="12" r="10" stroke="#059669" stroke-width="2"/>
                                        <polyline points="7 13 10 16 17 9"/>
                                    </svg>
                                </div>
                                <h3 style="margin-bottom: 1rem; font-size: 1.5rem; color: #0f172a;">Thank You!</h3>
                                <p class="success-message" style="color: #475569; margin-bottom: 2rem; font-size: 0.95rem;"></p>
                                <button type="button" class="btn btn-primary success-close-btn" style="width: 100%; border-radius: 9999px;">OK</button>
                            `;
                            reviewModal.querySelector('.review-modal-content').appendChild(successState);
                            
                            // Close modal on OK click
                            successState.querySelector('.success-close-btn').addEventListener('click', closeModal);
                        }
                        
                        successState.querySelector('.success-message').textContent = data.message;
                        
                        // Hide other form elements
                        const modalTitle = reviewModal.querySelector('#modalTitle');
                        const modalDesc = reviewModal.querySelector('.review-modal-content > p');
                        const modalForm = reviewModal.querySelector('#reviewForm');
                        
                        if (modalTitle) modalTitle.style.display = 'none';
                        if (modalDesc) modalDesc.style.display = 'none';
                        if (modalForm) modalForm.style.display = 'none';
                        
                        successState.style.display = 'block';
                    } else {
                        reviewStatus.className = 'form-status error';
                        reviewStatus.textContent = data.message || 'Submission failed. Please check inputs.';
                        reviewStatus.style.display = 'block';
                    }
                })
                .catch(error => {
                    console.error('Error submitting review:', error);
                    reviewStatus.className = 'form-status error';
                    reviewStatus.textContent = 'A network error occurred. Please try again.';
                    reviewStatus.style.display = 'block';
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                });
            });
        }
    }

    // --- Admin Dashboard Tabs Switching ---
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const dashboardTitle = document.getElementById('dashboardTitle');

    if (tabBtns.length > 0 && tabContents.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');

                // Toggle button styles
                tabBtns.forEach(b => {
                    b.classList.remove('btn-primary', 'active');
                    b.classList.add('btn-secondary');
                });
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary', 'active');

                // Toggle content visibility
                tabContents.forEach(content => {
                    if (content.id === `tabContent${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`) {
                        content.classList.add('active');
                        content.style.display = 'block';
                    } else {
                        content.classList.remove('active');
                        content.style.display = 'none';
                    }
                });

                // Update Title
                if (dashboardTitle) {
                    if (targetTab === 'rfqs') {
                        dashboardTitle.textContent = 'Submitted Quote RFQs';
                    } else if (targetTab === 'reviews') {
                        dashboardTitle.textContent = 'Submitted Customer Reviews';
                    } else if (targetTab === 'subscribers') {
                        dashboardTitle.textContent = 'Newsletter Subscribers';
                    }
                }
            });
        });
    }

    // --- Admin Dashboard Reviews Row Expansion ---
    const reviewExpandBtns = document.querySelectorAll('.review-expand-btn');
    if (reviewExpandBtns.length > 0) {
        reviewExpandBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const detailRow = document.getElementById(targetId);
                const isHidden = detailRow.style.display === 'none';

                // Close all open review detail rows
                document.querySelectorAll('.review-details-row').forEach(row => {
                    row.style.display = 'none';
                });
                document.querySelectorAll('.review-expand-btn').forEach(b => {
                    const icon = b.querySelector('svg');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });

                if (isHidden) {
                    detailRow.style.display = 'table-row';
                    const icon = btn.querySelector('svg');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                }
            });
        });
    }

    // --- Admin Dashboard Reviews Search Filtering ---
    const adminReviewSearchInput = document.getElementById('adminReviewSearch');
    const reviewRows = document.querySelectorAll('.review-item-row');
    if (adminReviewSearchInput && reviewRows.length > 0) {
        adminReviewSearchInput.addEventListener('input', () => {
            const query = adminReviewSearchInput.value.toLowerCase().trim();

            reviewRows.forEach(row => {
                const textContent = row.textContent.toLowerCase();
                const detailId = row.querySelector('.review-expand-btn').getAttribute('data-target');
                const detailRow = document.getElementById(detailId);

                if (textContent.includes(query)) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                    if (detailRow) detailRow.style.display = 'none';
                }
            });
        });
    }

    // --- Admin Dashboard Entry Deletion ---
    const deleteButtons = document.querySelectorAll('.delete-btn');
    if (deleteButtons.length > 0) {
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid triggering any row expansion click events
                const type = btn.getAttribute('data-type');
                const id = btn.getAttribute('data-id');
                const typeLabel = type === 'rfq' ? 'RFQ submission' : (type === 'review' ? 'customer review' : 'newsletter subscriber');

                if (confirm(`Are you sure you want to delete this ${typeLabel}?`)) {
                    btn.disabled = true;
                    const originalContent = btn.innerHTML;
                    btn.innerHTML = 'Deleting...';

                    fetch('/admin/delete/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            type: type,
                            id: id
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Success: remove row from table with smooth animation
                            let mainRow, detailRow;
                            if (type === 'rfq') {
                                mainRow = document.getElementById(`rfq-row-${id}`);
                                detailRow = document.getElementById(`detail-${id}`);
                            } else if (type === 'review') {
                                mainRow = document.getElementById(`rev-row-${id}`);
                                detailRow = document.getElementById(`rev-detail-${id}`);
                            } else if (type === 'subscriber') {
                                mainRow = document.getElementById(`sub-row-${id}`);
                            }

                            if (mainRow) {
                                mainRow.style.transition = 'all 0.3s ease';
                                mainRow.style.opacity = '0';
                                setTimeout(() => mainRow.remove(), 300);
                            }
                            if (detailRow) {
                                detailRow.style.transition = 'all 0.3s ease';
                                detailRow.style.opacity = '0';
                                setTimeout(() => detailRow.remove(), 300);
                            }
                        } else {
                            alert(data.message || 'Failed to delete the entry.');
                            btn.disabled = false;
                            btn.innerHTML = originalContent;
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting entry:', error);
                        alert('A network error occurred. Please try again.');
                        btn.disabled = false;
                        btn.innerHTML = originalContent;
                    });
                }
            });
        });
    }

    // --- Products Nav Dropdown Logic ---
    const productsNavBtn = document.getElementById('navProducts');
    if (productsNavBtn) {
        const parentLi = productsNavBtn.parentElement;
        const dropdownMenu = parentLi.querySelector('.dropdown-menu');

        if (dropdownMenu) {
            productsNavBtn.addEventListener('click', (e) => {
                if (window.innerWidth < 992) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const isOpen = parentLi.classList.contains('open');
                    
                    // Close any other open nav dropdowns first
                    document.querySelectorAll('.nav-dropdown-wrapper').forEach(wrapper => {
                        wrapper.classList.remove('open');
                        const menu = wrapper.querySelector('.dropdown-menu');
                        if (menu) menu.classList.remove('show');
                    });

                    if (!isOpen) {
                        parentLi.classList.add('open');
                        dropdownMenu.classList.add('show');
                    } else {
                        parentLi.classList.remove('open');
                        dropdownMenu.classList.remove('show');
                    }
                }
            });

            // Close dropdown when clicking outside (mostly for mobile/tablet)
            window.addEventListener('click', () => {
                parentLi.classList.remove('open');
                dropdownMenu.classList.remove('show');
            });
        }
    }

    // --- Product Innovation Showcase Tabs (about.html) ---
    const showcaseTabs = document.querySelectorAll('.showcase-tab');
    const showcaseContents = document.querySelectorAll('.showcase-content');
    
    if (showcaseTabs.length > 0 && showcaseContents.length > 0) {
        showcaseTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all tabs
                showcaseTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                // Activate clicked tab
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                
                // Switch contents
                const targetTabId = tab.getAttribute('data-showcase-tab');
                showcaseContents.forEach(content => {
                    if (content.id === `showcase-${targetTabId}`) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
    }

    // --- Gallery Lightbox Modal Logic ---
    const galleryModal = document.getElementById('galleryModal');
    const galleryTriggers = document.querySelectorAll('.gallery-trigger');
    const closeGalleryBtn = document.getElementById('closeGalleryModal');
    const galleryActiveImage = document.getElementById('galleryActiveImage');
    const galleryCaption = document.getElementById('galleryCaption');
    const galleryPrevBtn = document.getElementById('galleryPrevBtn');
    const galleryNextBtn = document.getElementById('galleryNextBtn');

    // Grid vs Lightbox toggles
    const galleryGridView = document.getElementById('galleryGridView');
    const galleryLightboxView = document.getElementById('galleryLightboxView');
    const galleryBackToGridBtn = document.getElementById('galleryBackToGridBtn');
    const galleryGridTitle = document.getElementById('galleryGridTitle');
    const galleryGridContainer = document.getElementById('galleryGridContainer');
    const galleryThumbnails = document.getElementById('galleryThumbnails');

    if (galleryModal && galleryTriggers.length > 0 && galleryGridContainer && galleryThumbnails) {
        const isbmImages = [
            { src: '/static/images/gallery_yellow.jpg', caption: 'Yellow Bottles Division', alt: 'Yellow Bottles', size: '100 ml - 1 Ltr' },
            { src: '/static/images/isbm_red.jpeg', caption: 'Orange Bottles Division', alt: 'Orange Bottles', size: '250 ml' },
            { src: '/static/images/isbm_green.jpg', caption: 'Green Bottles Division', alt: 'Green Bottles', size: '100 ml - 1 Ltr' },
            { src: '/static/images/isbm_blue.jpg', caption: 'Blue Bottles Division', alt: 'Blue Bottles', size: '100 ml - 1 Ltr' },
            { src: '/static/images/isbm_brown.jpg', caption: 'Brown Bottles Division', alt: 'Brown Bottles', size: '100 ml - 1 Ltr' },
            { src: '/static/images/isbm_eight.jpg', caption: 'Eight Bottles Division (1 Ltr)', alt: 'Eight Bottles', size: '500 ml' }
        ];

        const injectionImages = [
            { src: '/static/images/injection_preforms.png', caption: 'PET Preforms (Clear)', alt: 'Clear Preforms', size: 'PET Preforms' },
            { src: '/static/images/pet_preforms_bg.png', caption: 'PET Preforms (Industrial)', alt: 'Industrial Preforms', size: 'PET Preforms' },
            { src: '/static/images/injection_caps.png', caption: 'PP Caps & Closures', alt: 'Caps and Closures', size: 'PP Caps' }
        ];

        let currentImages = isbmImages;
        let currentImageIndex = 0;

        const updateGalleryImage = (index) => {
            currentImageIndex = index;
            
            // Fade out image
            galleryActiveImage.classList.remove('loaded');
            
            setTimeout(() => {
                if (currentImages[currentImageIndex]) {
                    galleryActiveImage.src = currentImages[currentImageIndex].src;
                    galleryCaption.textContent = currentImages[currentImageIndex].caption;
                }
                
                // Update active thumbnail
                const thumbs = galleryThumbnails.querySelectorAll('.gallery-thumb');
                thumbs.forEach((thumb, i) => {
                    if (i === currentImageIndex) {
                        thumb.classList.add('active');
                    } else {
                        thumb.classList.remove('active');
                    }
                });
            }, 150);
        };

        // When image is loaded, fade back in
        galleryActiveImage.addEventListener('load', () => {
            galleryActiveImage.classList.add('loaded');
        });

        // Function to render the grid and thumbnails
        const renderGallery = (type) => {
            currentImages = (type === 'injection') ? injectionImages : isbmImages;
            
            if (galleryGridTitle) {
                galleryGridTitle.textContent = (type === 'injection') ? 'Injection Molding Gallery' : 'Pet Bottles';
            }

            // Render Grid
            galleryGridContainer.innerHTML = '';
            currentImages.forEach((img, i) => {
                const card = document.createElement('div');
                card.className = 'gallery-grid-card';
                card.setAttribute('data-index', i);
                card.innerHTML = `
                    <div class="gallery-card-img-wrapper">
                        <img src="${img.src}" alt="${img.alt}">
                    </div>
                    <div class="gallery-card-info">
                        <span class="view-product-link">${img.size || 'View Product'}</span>
                    </div>
                `;
                card.addEventListener('click', () => {
                    if (galleryGridView) galleryGridView.style.display = 'none';
                    if (galleryLightboxView) galleryLightboxView.style.display = 'block';
                    galleryModal.classList.remove('grid-mode');
                    updateGalleryImage(i);
                });
                galleryGridContainer.appendChild(card);
            });

            // Render Thumbnails
            galleryThumbnails.innerHTML = '';
            currentImages.forEach((img, i) => {
                const thumb = document.createElement('img');
                thumb.className = 'gallery-thumb';
                thumb.src = img.src;
                thumb.setAttribute('data-index', i);
                thumb.alt = img.alt;
                thumb.addEventListener('click', () => {
                    updateGalleryImage(i);
                });
                galleryThumbnails.appendChild(thumb);
            });
        };

        // Trigger open
        galleryTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const galleryType = trigger.getAttribute('data-gallery');
                
                // Render correct category images dynamically
                renderGallery(galleryType);

                // Start in Grid View
                if (galleryGridView) galleryGridView.style.display = 'block';
                if (galleryLightboxView) galleryLightboxView.style.display = 'none';

                // Add grid-mode class to enable white background and scrolling page style
                galleryModal.classList.add('grid-mode');

                galleryModal.style.display = 'flex';
                // Trigger reflow for transition
                galleryModal.offsetHeight;
                galleryModal.classList.add('show');
                galleryModal.setAttribute('aria-hidden', 'false');
            });
        });

        // Back to Grid View
        if (galleryBackToGridBtn) {
            galleryBackToGridBtn.addEventListener('click', () => {
                if (galleryLightboxView) galleryLightboxView.style.display = 'none';
                if (galleryGridView) galleryGridView.style.display = 'block';
                
                // Add grid-mode class back to restore white background
                galleryModal.classList.add('grid-mode');
            });
        }

        const closeGallery = () => {
            galleryModal.classList.remove('show');
            galleryModal.setAttribute('aria-hidden', 'true');
            
            // Remove grid-mode class on close
            galleryModal.classList.remove('grid-mode');
            
            setTimeout(() => {
                galleryModal.style.display = 'none';
            }, 300);
        };

        if (closeGalleryBtn) {
            closeGalleryBtn.addEventListener('click', closeGallery);
        }

        window.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                closeGallery();
            }
        });

        if (galleryPrevBtn) {
            galleryPrevBtn.addEventListener('click', () => {
                let nextIdx = currentImageIndex - 1;
                if (nextIdx < 0) nextIdx = currentImages.length - 1;
                updateGalleryImage(nextIdx);
            });
        }

        if (galleryNextBtn) {
            galleryNextBtn.addEventListener('click', () => {
                let nextIdx = currentImageIndex + 1;
                if (nextIdx >= currentImages.length) nextIdx = 0;
                updateGalleryImage(nextIdx);
            });
        }

        // Keyboard Navigation
        window.addEventListener('keydown', (e) => {
            if (galleryModal.classList.contains('show')) {
                if (e.key === 'Escape') {
                    closeGallery();
                } else if (galleryLightboxView && galleryLightboxView.style.display !== 'none') {
                    if (e.key === 'ArrowLeft') {
                        galleryPrevBtn.click();
                    } else if (e.key === 'ArrowRight') {
                        galleryNextBtn.click();
                    }
                }
            }
        });
    }

    // --- Newsletter Form Submission ---
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        // Remove inline onsubmit first if it exists
        form.removeAttribute('onsubmit');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            if (!emailInput) return;
            const email = emailInput.value.trim();
            if (!email) return;

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Joining...';
            }

            fetch('/api/newsletter/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ emailAddress: email })
            })
            .then(response => response.json())
            .then(data => {
                showToast(data.message, data.success ? 'success' : 'error');
                if (data.success) {
                    form.reset();
                }
            })
            .catch(error => {
                console.error('Error subscribing to newsletter:', error);
                showToast('A network error occurred. Please try again.', 'error');
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Join';
                }
            });
        });
    });
});
