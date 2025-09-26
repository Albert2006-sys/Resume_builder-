// Professional Resume Builder - Complete Implementation
// Advanced features: Multiple templates, themes, drag & drop, export options, localStorage

// Global Variables
let resumeData = {
    personal: {},
    sections: {
        education: [],
        experience: [],
        skills: [],
        languages: [],
        certifications: [],
        hobbies: []
    },
    profilePicture: '',
    settings: {
        template: 'template-classic',
        theme: 'light',
        font: 'Inter, Arial, sans-serif',
        accent: '#3b82f6',
        sectionOrder: ['summary','experience','education','skills','languages','certifications','hobbies']
    }
};

let autoSaveTimeout;

// Initialize Resume Builder
function initializeResumeBuilder() {
    console.log('🚀 Professional Resume Builder v2.0 initialized!');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize drag & drop
    initializeDragAndDrop();
    
    // Load saved data
    loadResumeData();
    
    // Set initial template and theme
    setTemplate(resumeData.settings.template);
    setTheme(resumeData.settings.theme);
    
    // Add initial sections if none exist
    if (resumeData.sections.education.length === 0) addEducationEntry();
    if (resumeData.sections.experience.length === 0) addExperienceEntry();
    if (resumeData.sections.skills.length === 0) addSkillEntry();
    
    // Update preview
    updatePreview();
    // Initialize Section Order UI
    initSectionOrderUI();
    
    // Add notifications container if not exists
    if ($('#notifications').length === 0) {
        $('body').append('<div id="notifications"></div>');
    }
}

// Setup All Event Listeners
function setupEventListeners() {
    // Template and Theme Controls
    $('#templateSwitcher').change(function() {
        const template = $(this).val();
        setTemplate(template);
        resumeData.settings.template = template;
        updateTemplateBadge();
        saveResumeData();
    });
    
    $('#themeSwitcher').change(function() {
        const theme = $(this).val();
        setTheme(theme);
        resumeData.settings.theme = theme;
        saveResumeData();
    });
    
    $('#fontSwitcher').change(function() {
        const font = $(this).val();
        resumeData.settings.font = font;
        $('#resumePreview').css('font-family', font);
        updatePreview();
        saveResumeData();
    });
    
    // Profile Picture Upload
    $('#profilePicInput').change(function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                resumeData.profilePicture = e.target.result;
                updatePreview();
                saveResumeData();
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Personal Information
    $('#resumeForm input[type="text"], #resumeForm input[type="email"], #resumeForm input[type="tel"], #resumeForm input[type="url"], #resumeForm textarea').on('input', function() {
        updatePersonalData();
        updatePreview();
        autoSave();
    });
    
    // Section Management Buttons
    $('#addEducation').click(addEducationEntry);
    $('#addExperience').click(addExperienceEntry);
    $('#addSkill').click(addSkillEntry);
    $('#addLanguage').click(addLanguageEntry);
    $('#addCertification').click(addCertificationEntry);
    $('#addHobby').click(addHobbyEntry);
    
    // Export and Utility Buttons
    $('#downloadPDF').click(downloadPDF);
    $('#downloadWord').click(downloadWord);
    $('#downloadText').click(downloadText);
    $('#printResume').click(() => window.print());
    $('#saveResume').click(saveResumeData);
    $('#loadResume').click(loadResumeData);
    $('#clearForm').click(clearForm);
    $('#toggleTheme').click(toggleTheme);
    // Expand/Collapse all sections
    $('#expandAll').click(function(){
        $('.collapse').each(function(){
            const el = bootstrap.Collapse.getOrCreateInstance(this, {toggle:false});
            el.show();
        });
    });
    $('#collapseAll').click(function(){
        $('.collapse').each(function(){
            const el = bootstrap.Collapse.getOrCreateInstance(this, {toggle:false});
            el.hide();
        });
    });
    // Accent color picker
    $('#accentColor').on('input change', function() {
        const color = $(this).val();
        resumeData.settings.accent = color;
        document.documentElement.style.setProperty('--primary-light', color);
        document.documentElement.style.setProperty('--hover-color', color);
        updatePreview();
        autoSave();
    });
}

// Initialize Section Order UI
function initSectionOrderUI() {
    const order = resumeData.settings.sectionOrder || ['summary','experience','education','skills','languages','certifications','hobbies'];
    const names = {
        summary: 'Summary',
        experience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        languages: 'Languages',
        certifications: 'Certifications',
        hobbies: 'Hobbies'
    };
    const list = $('#sectionOrderList');
    if (!list.length) return; // UI might not be present on some pages
    list.empty();
    order.forEach(key => {
        list.append(`
            <li class="list-group-item d-flex align-items-center justify-content-between" data-key="${key}">
                <span>${names[key] || key}</span>
                <i class="fas fa-grip-lines order-handle"></i>
            </li>
        `);
    });
    if (window.Sortable) {
        if (list[0]._sortable) { try { list[0]._sortable.destroy(); } catch(e){} }
        list[0]._sortable = new Sortable(list[0], {
            handle: '.order-handle',
            animation: 150,
            onEnd: function() {
                const newOrder = [];
                list.find('li').each(function(){ newOrder.push($(this).data('key')); });
                resumeData.settings.sectionOrder = newOrder;
                saveResumeData();
                updatePreview();
            }
        });
    }
}

// Template Management
function setTemplate(templateName) {
    // Remove existing template
    $('#currentTemplate').remove();
    
    // Add new template CSS
    $('<link>')
        .attr('rel', 'stylesheet')
        .attr('href', 'templates/' + templateName + '.css')
        .attr('id', 'currentTemplate')
        .appendTo('head');
    
    resumeData.settings.template = templateName;
    setTimeout(updatePreview, 200);
}

function updateTemplateBadge() {
    const templateNames = {
        'template-classic': 'Classic Professional',
        'template-modern': 'Modern Creative', 
        'template-creative': 'Artistic Bold'
    };
    $('#currentTemplateBadge').text(templateNames[resumeData.settings.template] || 'Classic');
}

// Theme Management
function setTheme(themeName) {
    const body = $('body');
    const preview = $('#resumePreview');
    const themeClass = 'theme-' + themeName;

    // Reset theme classes on body and preview
    body.removeClass('theme-light theme-dark theme-professional theme-creative dark-mode');
    preview.removeClass('theme-light theme-dark theme-professional theme-creative');

    // Apply theme
    body.addClass(themeClass);
    preview.addClass(themeClass);

    // Align with global dark styles
    if (themeName === 'dark') {
        body.addClass('dark-mode');
    }

    resumeData.settings.theme = themeName;
    $('#themeSwitcher').val(themeName);
}

function toggleTheme() {
    const themes = ['light', 'dark', 'professional', 'creative'];
    const current = resumeData.settings.theme || 'light';
    const idx = themes.indexOf(current);
    const nextTheme = themes[(idx + 1) % themes.length];
    setTheme(nextTheme);
    saveResumeData();
}

// Section Management Functions
function addEducationEntry(data = {}) {
    const id = 'education_' + Date.now();
    const html = `
        <div class="section-item sortable-item fade-in" data-id="${id}" data-section="education">
            <div class="row">
                <div class="col-md-6 mb-2">
                    <label class="form-label">School/University</label>
                    <input type="text" class="form-control" data-field="school" value="${data.school || ''}" placeholder="Harvard University">
                </div>
                <div class="col-md-6 mb-2">
                    <label class="form-label">Degree</label>
                    <input type="text" class="form-control" data-field="degree" value="${data.degree || ''}" placeholder="Bachelor of Science">
                </div>
                <div class="col-md-6 mb-2">
                    <label class="form-label">Field of Study</label>
                    <input type="text" class="form-control" data-field="field" value="${data.field || ''}" placeholder="Computer Science">
                </div>
                <div class="col-md-6 mb-2">
                    <label class="form-label">Period</label>
                    <input type="text" class="form-control" data-field="period" value="${data.period || ''}" placeholder="2020-2024">
                </div>
                <div class="col-12 mb-2">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="2" data-field="description" placeholder="Relevant coursework, achievements...">${data.description || ''}</textarea>
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-danger remove-btn" onclick="removeSection(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    $('#educationContainer').append(html);
    bindSectionEvents();
    makeSortable('#educationContainer');
}

function addExperienceEntry(data = {}) {
    const id = 'experience_' + Date.now();
    const html = `
        <div class="section-item sortable-item fade-in" data-id="${id}" data-section="experience">
            <div class="row">
                <div class="col-md-6 mb-2">
                    <label class="form-label">Company</label>
                    <input type="text" class="form-control" data-field="company" value="${data.company || ''}" placeholder="Google Inc.">
                </div>
                <div class="col-md-6 mb-2">
                    <label class="form-label">Position</label>
                    <input type="text" class="form-control" data-field="position" value="${data.position || ''}" placeholder="Software Engineer">
                </div>
                <div class="col-md-6 mb-2">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-control" data-field="location" value="${data.location || ''}" placeholder="New York, NY">
                </div>
                <div class="col-md-6 mb-2">
                    <label class="form-label">Period</label>
                    <input type="text" class="form-control" data-field="period" value="${data.period || ''}" placeholder="Jan 2022 - Present">
                </div>
                <div class="col-12 mb-2">
                    <label class="form-label">Responsibilities & Achievements</label>
                    <textarea class="form-control" rows="3" data-field="description" placeholder="• Led development of key features\n• Improved system performance by 40%\n• Mentored junior developers">${data.description || ''}</textarea>
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-danger remove-btn" onclick="removeSection(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    $('#experienceContainer').append(html);
    bindSectionEvents();
    makeSortable('#experienceContainer');
}

function addSkillEntry(data = {}) {
    const id = 'skill_' + Date.now();
    const html = `
        <div class="section-item sortable-item fade-in" data-id="${id}" data-section="skills">
            <div class="row">
                <div class="col-md-8 mb-2">
                    <label class="form-label">Skill</label>
                    <input type="text" class="form-control" data-field="name" value="${data.name || ''}" placeholder="JavaScript, Python, React">
                </div>
                <div class="col-md-4 mb-2">
                    <label class="form-label">Level</label>
                    <select class="form-control" data-field="level">
                        <option value="">Select Level</option>
                        <option value="Beginner" ${data.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                        <option value="Intermediate" ${data.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                        <option value="Advanced" ${data.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
                        <option value="Expert" ${data.level === 'Expert' ? 'selected' : ''}>Expert</option>
                    </select>
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-danger remove-btn" onclick="removeSection(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    $('#skillsContainer').append(html);
    bindSectionEvents();
    makeSortable('#skillsContainer');
}

function addLanguageEntry(data = {}) {
    const id = 'language_' + Date.now();
    const html = `
        <div class="section-item sortable-item fade-in" data-id="${id}" data-section="languages">
            <div class="row">
                <div class="col-md-6 mb-2">
                    <label class="form-label">Language</label>
                    <input type="text" class="form-control" data-field="name" value="${data.name || ''}" placeholder="English, Spanish, French">
                </div>
                <div class="col-md-6 mb-2">
                    <label class="form-label">Proficiency</label>
                    <select class="form-control" data-field="level">
                        <option value="">Select Level</option>
                        <option value="Native" ${data.level === 'Native' ? 'selected' : ''}>Native</option>
                        <option value="Fluent" ${data.level === 'Fluent' ? 'selected' : ''}>Fluent</option>
                        <option value="Intermediate" ${data.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                        <option value="Basic" ${data.level === 'Basic' ? 'selected' : ''}>Basic</option>
                    </select>
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-danger remove-btn" onclick="removeSection(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    $('#languagesContainer').append(html);
    bindSectionEvents();
    makeSortable('#languagesContainer');
}

function addCertificationEntry(data = {}) {
    const id = 'cert_' + Date.now();
    const html = `
        <div class="section-item sortable-item fade-in" data-id="${id}" data-section="certifications">
            <div class="row">
                <div class="col-md-8 mb-2">
                    <label class="form-label">Certification Name</label>
                    <input type="text" class="form-control" data-field="name" value="${data.name || ''}" placeholder="AWS Certified Solutions Architect">
                </div>
                <div class="col-md-4 mb-2">
                    <label class="form-label">Year</label>
                    <input type="text" class="form-control" data-field="year" value="${data.year || ''}" placeholder="2024">
                </div>
                <div class="col-12 mb-2">
                    <label class="form-label">Issuing Organization</label>
                    <input type="text" class="form-control" data-field="organization" value="${data.organization || ''}" placeholder="Amazon Web Services">
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-danger remove-btn" onclick="removeSection(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    $('#certificationsContainer').append(html);
    bindSectionEvents();
    makeSortable('#certificationsContainer');
}

function addHobbyEntry(data = {}) {
    const id = 'hobby_' + Date.now();
    const html = `
        <div class="section-item sortable-item fade-in" data-id="${id}" data-section="hobbies">
            <div class="row">
                <div class="col-12 mb-2">
                    <label class="form-label">Hobby/Interest</label>
                    <input type="text" class="form-control" data-field="name" value="${data.name || ''}" placeholder="Photography, Hiking, Chess, Coding">
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-danger remove-btn" onclick="removeSection(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    $('#hobbiesContainer').append(html);
    bindSectionEvents();
    makeSortable('#hobbiesContainer');
}

// Remove Section Item
function removeSection(button) {
    const item = $(button).closest('.section-item');
    item.addClass('fade-out');
    setTimeout(() => {
        item.remove();
        updatePreview();
        saveResumeData();
    }, 300);
}

// Bind Events to Dynamic Sections
function bindSectionEvents() {
    $('.section-item input, .section-item textarea, .section-item select').off('input change').on('input change', function() {
        updateSectionData();
        updatePreview();
        autoSave();
    });
}

// Drag and Drop Functionality
function initializeDragAndDrop() {
    makeSortable('#educationContainer');
    makeSortable('#experienceContainer');
    makeSortable('#skillsContainer');
    makeSortable('#languagesContainer');
    makeSortable('#certificationsContainer');
    makeSortable('#hobbiesContainer');
}

function makeSortable(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Prefer SortableJS if available
    if (window.Sortable) {
        // Destroy existing instance if any (avoid duplicates)
        if (container._sortable) {
            try { container._sortable.destroy(); } catch (e) {}
        }
        container._sortable = new Sortable(container, {
            animation: 150,
            handle: undefined, // drag anywhere inside the item
            ghostClass: 'dragging',
            onEnd: function() {
                updateSectionData();
                updatePreview();
                saveResumeData();
            }
        });
        return;
    }

    // Fallback to jQuery UI Sortable if available
    if (typeof $ !== 'undefined' && $.fn && $.fn.sortable) {
        $(container).sortable({
            handle: '.sortable-handle',
            placeholder: 'sortable-placeholder',
            tolerance: 'pointer',
            start: function(e, ui) {
                ui.placeholder.height(ui.item.height());
            },
            update: function() {
                updateSectionData();
                updatePreview();
                saveResumeData();
            }
        });
    }
}

// Data Management
function updatePersonalData() {
    resumeData.personal = {
        fullName: $('#fullName').val() || '',
        email: $('#email').val() || '',
        phone: $('#phone').val() || '',
        address: $('#address').val() || '',
        linkedin: $('#linkedin').val() || '',
        github: $('#github').val() || '',
        website: $('#website').val() || '',
        summary: $('#summary').val() || ''
    };
}

function updateSectionData() {
    updatePersonalData();
    
    // Update all sections
    ['education', 'experience', 'skills', 'languages', 'certifications', 'hobbies'].forEach(section => {
        resumeData.sections[section] = [];
        $(`[data-section="${section}"]`).each(function() {
            const item = {};
            $(this).find('[data-field]').each(function() {
                const field = $(this).data('field');
                item[field] = $(this).val();
            });
            if (Object.values(item).some(val => val)) {
                resumeData.sections[section].push(item);
            }
        });
    });
}

// Preview Update Function
function updatePreview() {
    updateSectionData();
    
    const preview = $('#resumePreview');
    const template = resumeData.settings.template;
    
    let html = `<div class="resume-container ${template}">`;
    
    // Header Section
    html += `<div class="resume-header">`;
    
    if (resumeData.profilePicture) {
        html += `<div class="profile-picture">
            <img src="${resumeData.profilePicture}" alt="Profile Picture">
        </div>`;
    }
    
    html += `<div class="personal-info">
        <h1 class="name">${resumeData.personal.fullName || 'Your Name'}</h1>
        <div class="contact-info">
            ${resumeData.personal.email ? `<span class="contact-item"><i class="fas fa-envelope"></i> ${resumeData.personal.email}</span>` : ''}
            ${resumeData.personal.phone ? `<span class="contact-item"><i class="fas fa-phone"></i> ${resumeData.personal.phone}</span>` : ''}
            ${resumeData.personal.address ? `<span class="contact-item"><i class="fas fa-map-marker-alt"></i> ${resumeData.personal.address}</span>` : ''}
            ${resumeData.personal.linkedin ? `<span class="contact-item"><i class="fab fa-linkedin"></i> ${resumeData.personal.linkedin}</span>` : ''}
            ${resumeData.personal.github ? `<span class="contact-item"><i class="fab fa-github"></i> ${resumeData.personal.github}</span>` : ''}
            ${resumeData.personal.website ? `<span class="contact-item"><i class="fas fa-globe"></i> ${resumeData.personal.website}</span>` : ''}
        </div>
    </div></div>`;
    
    // Build sections HTML map
    const sectionsHtml = {};
    // Summary
    if (resumeData.personal.summary) {
        sectionsHtml.summary = `<div class="resume-section summary-section">
            <h2 class="section-title">Professional Summary</h2>
            <p class="summary-text">${resumeData.personal.summary.replace(/\n/g, '<br>')}</p>
        </div>`;
    }
    // Experience
    if (resumeData.sections.experience.length > 0) {
        let block = `<div class="resume-section experience-section">
            <h2 class="section-title">Professional Experience</h2>`;
        resumeData.sections.experience.forEach(exp => {
            block += `<div class="experience-item">
                <div class="experience-header">
                    <h3 class="position">${exp.position || 'Position'}</h3>
                    <span class="period">${exp.period || 'Period'}</span>
                </div>
                <div class="company-location">
                    <span class="company">${exp.company || 'Company'}</span>
                    ${exp.location ? `<span class="location">${exp.location}</span>` : ''}
                </div>
                ${exp.description ? `<div class="description">${exp.description.replace(/\n/g, '<br>')}</div>` : ''}
            </div>`;
        });
        block += `</div>`;
        sectionsHtml.experience = block;
    }
    // Education
    if (resumeData.sections.education.length > 0) {
        let block = `<div class="resume-section education-section">
            <h2 class="section-title">Education</h2>`;
        resumeData.sections.education.forEach(edu => {
            block += `<div class="education-item">
                <div class="education-header">
                    <h3 class="degree">${edu.degree || 'Degree'} ${edu.field ? `in ${edu.field}` : ''}</h3>
                    <span class="period">${edu.period || 'Period'}</span>
                </div>
                <div class="school">${edu.school || 'School'}</div>
                ${edu.description ? `<div class="description">${edu.description.replace(/\n/g, '<br>')}</div>` : ''}
            </div>`;
        });
        block += `</div>`;
        sectionsHtml.education = block;
    }
    // Skills
    if (resumeData.sections.skills.length > 0) {
        let block = `<div class="resume-section skills-section">
            <h2 class="section-title">Skills</h2>
            <div class="skills-grid">`;
        resumeData.sections.skills.forEach(skill => {
            block += `<div class="skill-item">
                <span class="skill-name">${skill.name || 'Skill'}</span>
                ${skill.level ? `<span class="skill-level">${skill.level}</span>` : ''}
            </div>`;
        });
        block += `</div></div>`;
        sectionsHtml.skills = block;
    }
    // Languages
    if (resumeData.sections.languages.length > 0) {
        let block = `<div class="resume-section languages-section">
            <h2 class="section-title">Languages</h2>
            <div class="languages-grid">`;
        resumeData.sections.languages.forEach(lang => {
            block += `<div class="language-item">
                <span class="language-name">${lang.name || 'Language'}</span>
                ${lang.level ? `<span class="language-level">${lang.level}</span>` : ''}
            </div>`;
        });
        block += `</div></div>`;
        sectionsHtml.languages = block;
    }
    // Certifications
    if (resumeData.sections.certifications.length > 0) {
        let block = `<div class="resume-section certifications-section">
            <h2 class="section-title">Certifications</h2>`;
        resumeData.sections.certifications.forEach(cert => {
            block += `<div class="certification-item">
                <h3 class="cert-name">${cert.name || 'Certification'}</h3>
                <div class="cert-details">
                    ${cert.organization ? `<span class="cert-org">${cert.organization}</span>` : ''}
                    ${cert.year ? `<span class="cert-year">${cert.year}</span>` : ''}
                </div>
            </div>`;
        });
        block += `</div>`;
        sectionsHtml.certifications = block;
    }
    // Hobbies
    if (resumeData.sections.hobbies.length > 0) {
        let block = `<div class="resume-section hobbies-section">
            <h2 class="section-title">Interests & Hobbies</h2>
            <div class="hobbies-list">`;
        resumeData.sections.hobbies.forEach((hobby, index) => {
            block += `<span class="hobby-item">${hobby.name || 'Hobby'}${index < resumeData.sections.hobbies.length - 1 ? ', ' : ''}</span>`;
        });
        block += `</div></div>`;
        sectionsHtml.hobbies = block;
    }

    // Append in configured order
    const order = (resumeData.settings.sectionOrder && resumeData.settings.sectionOrder.length)
        ? resumeData.settings.sectionOrder
        : ['summary','experience','education','skills','languages','certifications','hobbies'];
    order.forEach(key => { if (sectionsHtml[key]) html += sectionsHtml[key]; });
    
    html += `</div>`;
    
    preview.html(html);
    
    // Apply font setting
    preview.css('font-family', resumeData.settings.font);

    // Optional: make preview sections sortable as a whole in future
    // Example hook (disabled by default):
    // makeSortable('#resumePreview');
}

// Helper to get jsPDF class from different globals (UMD)
function getJsPDFClass() {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    if (window.jsPDF) return window.jsPDF; // some builds expose this
    return null;
}

// Export Functions
async function downloadPDF() {
    showExportProgress('PDF');
    try {
        const element = document.getElementById('resumePreview');
        const JsPDFClass = getJsPDFClass();

        if (typeof window.html2canvas === 'function' && JsPDFClass) {
            // Render the element to canvas at higher scale for clarity
            const canvas = await window.html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new JsPDFClass('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight; // negative to move image up
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = (resumeData.personal.fullName || 'Resume').replace(/\s+/g, '_') + '_Resume.pdf';
            pdf.save(fileName);
            showNotification('PDF downloaded successfully!', 'success');
        } else {
            showNotification('PDF libraries not available. Opening print dialog as fallback.', 'warning');
            window.print();
        }
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('PDF generation failed. Opening print dialog.', 'warning');
        window.print();
    }
    hideExportProgress();
}

function downloadWord() {
    showExportProgress('Word Document');
    try {
        const element = document.getElementById('resumePreview');
        const contentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:${resumeData.settings.font};} .resume-container{max-width:800px;margin:0 auto;}</style></head><body>${element.innerHTML}</body></html>`;
        if (window.HTMLDocx) {
            const blob = window.HTMLDocx.asBlob(contentHtml, {orientation: 'portrait'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const fileName = (resumeData.personal.fullName || 'Resume').replace(/\s+/g, '_') + '_Resume.docx';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('Word document downloaded successfully!', 'success');
        } else {
            // Fallback to .doc HTML approach
            const blob = new Blob([contentHtml], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const fileName = (resumeData.personal.fullName || 'Resume').replace(/\s+/g, '_') + '_Resume.doc';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('Word document downloaded (legacy .doc format).', 'info');
        }
    } catch (error) {
        console.error('Word download error:', error);
        showNotification('Word download failed', 'error');
    }
    hideExportProgress();
}

function downloadText() {
    showExportProgress('Text File');
    
    try {
        let textContent = '';
        
        // Header
        textContent += `${resumeData.personal.fullName || 'YOUR NAME'}\n`;
        textContent += '='.repeat((resumeData.personal.fullName || 'YOUR NAME').length) + '\n\n';
        
        // Contact Information
        if (resumeData.personal.email) textContent += `Email: ${resumeData.personal.email}\n`;
        if (resumeData.personal.phone) textContent += `Phone: ${resumeData.personal.phone}\n`;
        if (resumeData.personal.address) textContent += `Address: ${resumeData.personal.address}\n`;
        if (resumeData.personal.linkedin) textContent += `LinkedIn: ${resumeData.personal.linkedin}\n`;
        if (resumeData.personal.github) textContent += `GitHub: ${resumeData.personal.github}\n`;
        if (resumeData.personal.website) textContent += `Website: ${resumeData.personal.website}\n`;
        textContent += '\n';
        
        // Summary
        if (resumeData.personal.summary) {
            textContent += 'PROFESSIONAL SUMMARY\n';
            textContent += '-'.repeat(20) + '\n';
            textContent += `${resumeData.personal.summary}\n\n`;
        }
        
        // Experience
        if (resumeData.sections.experience.length > 0) {
            textContent += 'PROFESSIONAL EXPERIENCE\n';
            textContent += '-'.repeat(25) + '\n';
            resumeData.sections.experience.forEach(exp => {
                textContent += `${exp.position || 'Position'} | ${exp.company || 'Company'}\n`;
                textContent += `${exp.period || 'Period'}${exp.location ? ` | ${exp.location}` : ''}\n`;
                if (exp.description) textContent += `${exp.description}\n`;
                textContent += '\n';
            });
        }
        
        // Education
        if (resumeData.sections.education.length > 0) {
            textContent += 'EDUCATION\n';
            textContent += '-'.repeat(9) + '\n';
            resumeData.sections.education.forEach(edu => {
                textContent += `${edu.degree || 'Degree'}${edu.field ? ` in ${edu.field}` : ''}\n`;
                textContent += `${edu.school || 'School'} | ${edu.period || 'Period'}\n`;
                if (edu.description) textContent += `${edu.description}\n`;
                textContent += '\n';
            });
        }
        
        // Skills
        if (resumeData.sections.skills.length > 0) {
            textContent += 'SKILLS\n';
            textContent += '-'.repeat(6) + '\n';
            resumeData.sections.skills.forEach(skill => {
                textContent += `• ${skill.name || 'Skill'}${skill.level ? ` (${skill.level})` : ''}\n`;
            });
            textContent += '\n';
        }
        
        // Languages
        if (resumeData.sections.languages.length > 0) {
            textContent += 'LANGUAGES\n';
            textContent += '-'.repeat(9) + '\n';
            resumeData.sections.languages.forEach(lang => {
                textContent += `• ${lang.name || 'Language'}${lang.level ? ` (${lang.level})` : ''}\n`;
            });
            textContent += '\n';
        }
        
        // Certifications
        if (resumeData.sections.certifications.length > 0) {
            textContent += 'CERTIFICATIONS\n';
            textContent += '-'.repeat(14) + '\n';
            resumeData.sections.certifications.forEach(cert => {
                textContent += `• ${cert.name || 'Certification'}\n`;
                textContent += `  ${cert.organization || 'Organization'}${cert.year ? ` (${cert.year})` : ''}\n`;
            });
            textContent += '\n';
        }
        
        // Hobbies
        if (resumeData.sections.hobbies.length > 0) {
            textContent += 'INTERESTS & HOBBIES\n';
            textContent += '-'.repeat(19) + '\n';
            const hobbies = resumeData.sections.hobbies.map(h => h.name).filter(n => n).join(', ');
            textContent += `${hobbies}\n`;
        }
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fileName = (resumeData.personal.fullName || 'Resume').replace(/\s+/g, '_') + '_Resume.txt';
        
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('Text file downloaded successfully!', 'success');
    } catch (error) {
        console.error('Text download error:', error);
        showNotification('Text download failed', 'error');
    }
    
    hideExportProgress();
}

// Utility Functions
function clearForm() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        // Clear form inputs
        $('#resumeForm')[0].reset();
        
        // Clear dynamic sections
        $('#educationContainer').empty();
        $('#experienceContainer').empty();
        $('#skillsContainer').empty();
        $('#languagesContainer').empty();
        $('#certificationsContainer').empty();
        $('#hobbiesContainer').empty();
        
        // Reset data
        resumeData = {
            personal: {},
            sections: {
                education: [],
                experience: [],
                skills: [],
                languages: [],
                certifications: [],
                hobbies: []
            },
            profilePicture: '',
            settings: {
                template: 'template1',
                theme: 'light',
                font: 'Inter, Arial, sans-serif'
            }
        };
        
        // Add initial sections
        addEducationEntry();
        addExperienceEntry();
        addSkillEntry();
        
        // Clear storage and update preview
        localStorage.removeItem('resumeBuilderData');
        updatePreview();
        
        showNotification('Form cleared successfully!', 'success');
    }
}

// Storage Functions
function saveResumeData() {
    try {
        updateSectionData();
        localStorage.setItem('resumeBuilderData', JSON.stringify(resumeData));
        console.log('Resume data saved to localStorage');
    } catch (error) {
        console.error('Error saving resume data:', error);
        showNotification('Failed to save data', 'error');
    }
}

function loadResumeData() {
    try {
        const savedData = localStorage.getItem('resumeBuilderData');
        if (savedData) {
            resumeData = { ...resumeData, ...JSON.parse(savedData) };
            console.log('Resume data loaded from localStorage');
            
            // Populate form fields
            Object.keys(resumeData.personal).forEach(key => {
                const element = $(`#${key}`);
                if (element.length) {
                    element.val(resumeData.personal[key]);
                }
            });
            
            // Populate sections
            Object.keys(resumeData.sections).forEach(section => {
                const container = $(`#${section}Container`);
                container.empty();
                
                if (resumeData.sections[section].length > 0) {
                    resumeData.sections[section].forEach(item => {
                        switch(section) {
                            case 'education':
                                addEducationEntry(item);
                                break;
                            case 'experience':
                                addExperienceEntry(item);
                                break;
                            case 'skills':
                                addSkillEntry(item);
                                break;
                            case 'languages':
                                addLanguageEntry(item);
                                break;
                            case 'certifications':
                                addCertificationEntry(item);
                                break;
                            case 'hobbies':
                                addHobbyEntry(item);
                                break;
                        }
                    });
                }
            });
            
            // Apply settings
            setTemplate(resumeData.settings.template);
            setTheme(resumeData.settings.theme);
            $('#templateSwitcher').val(resumeData.settings.template);
            $('#themeSwitcher').val(resumeData.settings.theme);
            $('#fontSwitcher').val(resumeData.settings.font);
            // Ensure section order present
            if (!resumeData.settings.sectionOrder || !resumeData.settings.sectionOrder.length) {
                resumeData.settings.sectionOrder = ['summary','experience','education','skills','languages','certifications','hobbies'];
            }
            // Initialize/rebuild section order UI if present
            setTimeout(initSectionOrderUI, 0);
            
            updatePreview();
            showNotification('Resume data loaded successfully!', 'success');
        }
    } catch (error) {
        console.error('Error loading resume data:', error);
        showNotification('Failed to load saved data', 'error');
    }
}

// Auto-save functionality
function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        saveResumeData();
    }, 1000); // Save 1 second after last change
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = $(`
        <div class="notification notification-${type} fade-in">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `);
    
    $('#notifications').append(notification);
    
    notification.find('.notification-close').click(function() {
        notification.addClass('fade-out');
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parent().length) {
            notification.addClass('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Export Progress
function showExportProgress(type) {
    const modal = $(`
        <div class="export-modal">
            <div class="export-modal-content">
                <div class="loading-spinner"></div>
                <h3>Generating ${type}...</h3>
                <p>Please wait while we prepare your resume.</p>
            </div>
        </div>
    `);
    
    $('body').append(modal);
}

function hideExportProgress() {
    $('.export-modal').fadeOut(300, function() {
        $(this).remove();
    });
}

// Initialize on page load
$(document).ready(function() {
    initializeResumeBuilder();
    console.log('🎯 Professional Resume Builder v2.0 - Ready to create amazing resumes!');
});