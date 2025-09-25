// Resume Builder JavaScript

class ResumeBuilder {
    constructor() {
        this.educationCount = 0;
        this.experienceCount = 0;
        this.skillsCount = 0;
        this.resumeData = {
            personal: {},
            education: [],
            experience: [],
            skills: []
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromStorage();
        this.updatePreview();
        
        // Add initial items
        this.addEducationEntry();
        this.addExperienceEntry();
        this.addSkillEntry();
    }

    bindEvents() {
        // Personal information events
        document.querySelectorAll('#fullName, #email, #phone, #address, #linkedin, #github, #summary').forEach(field => {
            field.addEventListener('input', () => {
                this.updatePersonalData();
                this.updatePreview();
                this.saveToStorage();
            });
        });

        // Section add buttons
        document.getElementById('addEducation').addEventListener('click', () => this.addEducationEntry());
        document.getElementById('addExperience').addEventListener('click', () => this.addExperienceEntry());
        document.getElementById('addSkill').addEventListener('click', () => this.addSkillEntry());

        // Action buttons
        document.getElementById('downloadPDF').addEventListener('click', () => this.downloadPDF());
        document.getElementById('clearForm').addEventListener('click', () => this.clearForm());
        document.getElementById('toggleTheme').addEventListener('click', () => this.toggleTheme());

        // Auto-save on form changes
        document.getElementById('resumeForm').addEventListener('input', () => {
            this.saveToStorage();
        });
    }

    updatePersonalData() {
        this.resumeData.personal = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            linkedin: document.getElementById('linkedin').value,
            github: document.getElementById('github').value,
            summary: document.getElementById('summary').value
        };
    }

    addEducationEntry() {
        this.educationCount++;
        const container = document.getElementById('educationContainer');
        
        const educationHTML = `
            <div class="section-item fade-in" data-id="education-${this.educationCount}">
                <button type="button" class="btn btn-sm btn-danger remove-btn" onclick="resumeBuilder.removeEntry(this)">
                    <i class="fas fa-times"></i>
                </button>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">School/College *</label>
                        <input type="text" class="form-control education-school" placeholder="University name" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Degree *</label>
                        <input type="text" class="form-control education-degree" placeholder="Bachelor of Science" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Start Year</label>
                        <input type="number" class="form-control education-start" min="1950" max="2030" placeholder="2020">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">End Year</label>
                        <input type="number" class="form-control education-end" min="1950" max="2030" placeholder="2024">
                    </div>
                    <div class="col-12 mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control education-description" rows="2" placeholder="Additional details, achievements, relevant coursework..."></textarea>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', educationHTML);
        this.bindSectionEvents();
    }

    addExperienceEntry() {
        this.experienceCount++;
        const container = document.getElementById('experienceContainer');
        
        const experienceHTML = `
            <div class="section-item fade-in sortable" data-id="experience-${this.experienceCount}">
                <button type="button" class="btn btn-sm btn-danger remove-btn" onclick="resumeBuilder.removeEntry(this)">
                    <i class="fas fa-times"></i>
                </button>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Job Title *</label>
                        <input type="text" class="form-control experience-title" placeholder="Software Developer" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Company *</label>
                        <input type="text" class="form-control experience-company" placeholder="Company Name" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Start Date</label>
                        <input type="month" class="form-control experience-start">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">End Date</label>
                        <input type="month" class="form-control experience-end">
                        <div class="form-check mt-2">
                            <input class="form-check-input experience-current" type="checkbox">
                            <label class="form-check-label">Currently working here</label>
                        </div>
                    </div>
                    <div class="col-12 mb-3">
                        <label class="form-label">Job Responsibilities</label>
                        <textarea class="form-control experience-description" rows="3" placeholder="• Developed web applications using React and Node.js&#10;• Collaborated with cross-functional teams&#10;• Implemented responsive designs"></textarea>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', experienceHTML);
        this.bindSectionEvents();
    }

    addSkillEntry() {
        this.skillsCount++;
        const container = document.getElementById('skillsContainer');
        
        const skillHTML = `
            <div class="section-item fade-in" data-id="skill-${this.skillsCount}">
                <button type="button" class="btn btn-sm btn-danger remove-btn" onclick="resumeBuilder.removeEntry(this)">
                    <i class="fas fa-times"></i>
                </button>
                <div class="row">
                    <div class="col-md-8 mb-3">
                        <label class="form-label">Skill *</label>
                        <input type="text" class="form-control skill-name" placeholder="JavaScript, Python, etc." required>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Proficiency Level</label>
                        <select class="form-control skill-level">
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate" selected>Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', skillHTML);
        this.bindSectionEvents();
    }

    removeEntry(button) {
        const entry = button.closest('.section-item');
        entry.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            entry.remove();
            this.updatePreview();
            this.saveToStorage();
        }, 300);
    }

    bindSectionEvents() {
        // Bind input events for all form fields
        document.querySelectorAll('.section-item input, .section-item textarea, .section-item select').forEach(field => {
            field.addEventListener('input', () => {
                this.updatePreview();
                this.saveToStorage();
            });
        });

        // Handle current job checkbox
        document.querySelectorAll('.experience-current').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const endDateField = e.target.closest('.section-item').querySelector('.experience-end');
                endDateField.disabled = e.target.checked;
                if (e.target.checked) {
                    endDateField.value = '';
                }
                this.updatePreview();
                this.saveToStorage();
            });
        });
    }

    updatePreview() {
        const previewContent = document.querySelector('.preview-content');
        const personal = this.getPersonalData();
        const education = this.getEducationData();
        const experience = this.getExperienceData();
        const skills = this.getSkillsData();

        let html = '';

        // Personal Information Header
        if (personal.fullName || personal.email || personal.phone) {
            html += `
                <div class="preview-header">
                    ${personal.fullName ? `<div class="preview-name">${personal.fullName}</div>` : ''}
                    <div class="preview-contact">
                        ${personal.email ? `<span><i class="fas fa-envelope"></i> ${personal.email}</span>` : ''}
                        ${personal.phone ? `<span class="ms-3"><i class="fas fa-phone"></i> ${personal.phone}</span>` : ''}
                    </div>
                    ${personal.address ? `<div class="preview-contact"><i class="fas fa-map-marker-alt"></i> ${personal.address}</div>` : ''}
                    <div class="preview-contact">
                        ${personal.linkedin ? `<span><i class="fab fa-linkedin"></i> LinkedIn</span>` : ''}
                        ${personal.github ? `<span class="ms-3"><i class="fab fa-github"></i> GitHub</span>` : ''}
                    </div>
                </div>
            `;
        }

        // Professional Summary
        if (personal.summary) {
            html += `
                <div class="preview-section">
                    <div class="preview-section-title">Professional Summary</div>
                    <div class="preview-summary">${personal.summary}</div>
                </div>
            `;
        }

        // Work Experience
        if (experience.length > 0) {
            html += `
                <div class="preview-section">
                    <div class="preview-section-title">Work Experience</div>
            `;
            
            experience.forEach(exp => {
                if (exp.title && exp.company) {
                    const startDate = exp.start ? new Date(exp.start).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '';
                    const endDate = exp.current ? 'Present' : (exp.end ? new Date(exp.end).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '');
                    const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : (startDate || endDate);

                    html += `
                        <div class="preview-item">
                            <div class="preview-item-header">
                                <div>
                                    <div class="preview-item-title">${exp.title}</div>
                                    <div class="preview-item-subtitle">${exp.company}</div>
                                </div>
                                ${dateRange ? `<div class="preview-item-date">${dateRange}</div>` : ''}
                            </div>
                            ${exp.description ? `<div class="preview-item-description">${exp.description.replace(/\n/g, '<br>')}</div>` : ''}
                        </div>
                    `;
                }
            });
            
            html += `</div>`;
        }

        // Education
        if (education.length > 0) {
            html += `
                <div class="preview-section">
                    <div class="preview-section-title">Education</div>
            `;
            
            education.forEach(edu => {
                if (edu.school && edu.degree) {
                    const dateRange = edu.start && edu.end ? `${edu.start} - ${edu.end}` : (edu.start || edu.end);
                    
                    html += `
                        <div class="preview-item">
                            <div class="preview-item-header">
                                <div>
                                    <div class="preview-item-title">${edu.degree}</div>
                                    <div class="preview-item-subtitle">${edu.school}</div>
                                </div>
                                ${dateRange ? `<div class="preview-item-date">${dateRange}</div>` : ''}
                            </div>
                            ${edu.description ? `<div class="preview-item-description">${edu.description}</div>` : ''}
                        </div>
                    `;
                }
            });
            
            html += `</div>`;
        }

        // Skills
        if (skills.length > 0) {
            html += `
                <div class="preview-section">
                    <div class="preview-section-title">Skills</div>
                    <div class="skills-grid">
            `;
            
            skills.forEach(skill => {
                if (skill.name) {
                    html += `
                        <div class="skill-item">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-level">${skill.level}</span>
                        </div>
                    `;
                }
            });
            
            html += `</div></div>`;
        }

        // Default message if no content
        if (!html) {
            html = `
                <div class="text-center text-muted">
                    <i class="fas fa-file-alt fa-3x mb-3"></i>
                    <p>Start filling the form to see your resume preview</p>
                </div>
            `;
        }

        previewContent.innerHTML = html;
    }

    getPersonalData() {
        return {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            linkedin: document.getElementById('linkedin').value,
            github: document.getElementById('github').value,
            summary: document.getElementById('summary').value
        };
    }

    getEducationData() {
        const educationItems = document.querySelectorAll('#educationContainer .section-item');
        return Array.from(educationItems).map(item => ({
            school: item.querySelector('.education-school').value,
            degree: item.querySelector('.education-degree').value,
            start: item.querySelector('.education-start').value,
            end: item.querySelector('.education-end').value,
            description: item.querySelector('.education-description').value
        })).filter(item => item.school || item.degree);
    }

    getExperienceData() {
        const experienceItems = document.querySelectorAll('#experienceContainer .section-item');
        return Array.from(experienceItems).map(item => ({
            title: item.querySelector('.experience-title').value,
            company: item.querySelector('.experience-company').value,
            start: item.querySelector('.experience-start').value,
            end: item.querySelector('.experience-end').value,
            current: item.querySelector('.experience-current').checked,
            description: item.querySelector('.experience-description').value
        })).filter(item => item.title || item.company);
    }

    getSkillsData() {
        const skillItems = document.querySelectorAll('#skillsContainer .section-item');
        return Array.from(skillItems).map(item => ({
            name: item.querySelector('.skill-name').value,
            level: item.querySelector('.skill-level').value
        })).filter(item => item.name);
    }

    async downloadPDF() {
        const button = document.getElementById('downloadPDF');
        const originalText = button.innerHTML;
        button.innerHTML = '⟳ Preparing...';
        button.disabled = true;

        try {
            // Since external PDF libraries are blocked, we'll use the browser's print functionality
            // Create a new window with just the resume content
            const previewElement = document.querySelector('.preview-content');
            const resumeContent = previewElement.innerHTML;
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Resume - ${this.getPersonalData().fullName || 'Resume'}</title>
                    <style>
                        body {
                            font-family: 'Times New Roman', serif;
                            font-size: 12px;
                            line-height: 1.4;
                            color: #333;
                            margin: 20px;
                            background: white;
                        }
                        .preview-header {
                            text-align: center;
                            border-bottom: 2px solid #333;
                            padding-bottom: 15px;
                            margin-bottom: 20px;
                        }
                        .preview-name {
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 5px;
                            color: #2c3e50;
                        }
                        .preview-contact {
                            font-size: 11px;
                            color: #666;
                            margin-bottom: 3px;
                        }
                        .preview-section {
                            margin-bottom: 18px;
                        }
                        .preview-section-title {
                            font-size: 14px;
                            font-weight: bold;
                            color: #2c3e50;
                            border-bottom: 1px solid #bdc3c7;
                            padding-bottom: 3px;
                            margin-bottom: 8px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        .preview-item {
                            margin-bottom: 12px;
                        }
                        .preview-item-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 4px;
                        }
                        .preview-item-title {
                            font-weight: bold;
                            color: #2c3e50;
                        }
                        .preview-item-subtitle {
                            color: #7f8c8d;
                            font-style: italic;
                        }
                        .preview-item-date {
                            color: #95a5a6;
                            font-size: 10px;
                        }
                        .preview-item-description {
                            color: #555;
                            font-size: 11px;
                            margin-top: 3px;
                        }
                        .preview-summary {
                            text-align: justify;
                            font-size: 11px;
                            line-height: 1.4;
                            color: #444;
                        }
                        .skills-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                            gap: 5px;
                        }
                        .skill-item {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 3px 0;
                            border-bottom: 1px solid #ecf0f1;
                        }
                        .skill-name {
                            font-weight: 500;
                            color: #2c3e50;
                        }
                        .skill-level {
                            color: #7f8c8d;
                            font-size: 10px;
                        }
                        @media print {
                            body { margin: 0; }
                            @page { margin: 0.5in; }
                        }
                    </style>
                </head>
                <body>
                    ${resumeContent}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            };
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error preparing PDF. Please try again or use your browser\'s print function (Ctrl+P).');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    clearForm() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            document.getElementById('resumeForm').reset();
            document.getElementById('educationContainer').innerHTML = '';
            document.getElementById('experienceContainer').innerHTML = '';
            document.getElementById('skillsContainer').innerHTML = '';
            
            this.educationCount = 0;
            this.experienceCount = 0;
            this.skillsCount = 0;
            
            this.addEducationEntry();
            this.addExperienceEntry();
            this.addSkillEntry();
            
            this.updatePreview();
            this.clearStorage();
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const button = document.getElementById('toggleTheme');
        const isDark = document.body.classList.contains('dark-mode');
        
        button.innerHTML = isDark ? 
            '<i class="fas fa-sun me-1"></i>Light Mode' : 
            '<i class="fas fa-moon me-1"></i>Dark Mode';
        
        localStorage.setItem('darkMode', isDark);
    }

    saveToStorage() {
        const resumeData = {
            personal: this.getPersonalData(),
            education: this.getEducationData(),
            experience: this.getExperienceData(),
            skills: this.getSkillsData(),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('resumeData');
        const darkMode = localStorage.getItem('darkMode') === 'true';
        
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('toggleTheme').innerHTML = '<i class="fas fa-sun me-1"></i>Light Mode';
        }
        
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.loadPersonalData(data.personal);
                this.loadSectionData(data);
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    loadPersonalData(personal) {
        if (personal) {
            Object.keys(personal).forEach(key => {
                const element = document.getElementById(key);
                if (element && personal[key]) {
                    element.value = personal[key];
                }
            });
        }
    }

    loadSectionData(data) {
        // Clear existing entries
        document.getElementById('educationContainer').innerHTML = '';
        document.getElementById('experienceContainer').innerHTML = '';
        document.getElementById('skillsContainer').innerHTML = '';
        
        // Load education data
        if (data.education && data.education.length > 0) {
            data.education.forEach(edu => {
                this.addEducationEntry();
                const lastItem = document.querySelector('#educationContainer .section-item:last-child');
                lastItem.querySelector('.education-school').value = edu.school || '';
                lastItem.querySelector('.education-degree').value = edu.degree || '';
                lastItem.querySelector('.education-start').value = edu.start || '';
                lastItem.querySelector('.education-end').value = edu.end || '';
                lastItem.querySelector('.education-description').value = edu.description || '';
            });
        }
        
        // Load experience data
        if (data.experience && data.experience.length > 0) {
            data.experience.forEach(exp => {
                this.addExperienceEntry();
                const lastItem = document.querySelector('#experienceContainer .section-item:last-child');
                lastItem.querySelector('.experience-title').value = exp.title || '';
                lastItem.querySelector('.experience-company').value = exp.company || '';
                lastItem.querySelector('.experience-start').value = exp.start || '';
                lastItem.querySelector('.experience-end').value = exp.end || '';
                lastItem.querySelector('.experience-current').checked = exp.current || false;
                lastItem.querySelector('.experience-description').value = exp.description || '';
                
                if (exp.current) {
                    lastItem.querySelector('.experience-end').disabled = true;
                }
            });
        }
        
        // Load skills data
        if (data.skills && data.skills.length > 0) {
            data.skills.forEach(skill => {
                this.addSkillEntry();
                const lastItem = document.querySelector('#skillsContainer .section-item:last-child');
                lastItem.querySelector('.skill-name').value = skill.name || '';
                lastItem.querySelector('.skill-level').value = skill.level || 'Intermediate';
            });
        }
    }

    clearStorage() {
        localStorage.removeItem('resumeData');
    }
}

// Initialize the resume builder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.resumeBuilder = new ResumeBuilder();
});

// Add fade out animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);