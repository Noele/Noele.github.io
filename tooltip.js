class Tooltip {
    constructor(element) {
        this.element = element;
        this.tooltip = null;
        this.html = element.getAttribute('data-tooltip');
        this.createTooltip();
        this.addEventListeners();
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.tooltip.innerHTML = this.html;
        document.body.appendChild(this.tooltip);
    }

    addEventListeners() {
        this.element.addEventListener('mousemove', this.showTooltip.bind(this));
        this.element.addEventListener('mouseenter', this.showTooltip.bind(this));
        this.element.addEventListener('mouseleave', this.hideTooltip.bind(this));
        this.element.addEventListener('touchstart', this.showTooltip.bind(this));
        this.element.addEventListener('touchend', this.hideTooltip.bind(this));
    }

    showTooltip(e) {
        this.tooltip.style.visibility = 'visible';
        
        const rect = this.element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        let left = e.type.includes('touch') ? 
            rect.left + (rect.width / 2) - (tooltipRect.width / 2) :
            e.clientX + 10;
            
        let top = e.type.includes('touch') ?
            rect.top - tooltipRect.height - 10 :
            e.clientY + 10;

        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (left < 0) {
            left = 10;
        }
        if (top + tooltipRect.height > window.innerHeight) {
            top = window.innerHeight - tooltipRect.height - 10;
        }
        if (top < 0) {
            top = 10;
        }

        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
        
        setTimeout(() => {
            this.tooltip.style.opacity = '1';
        }, 10);
    }

    hideTooltip() {
        this.tooltip.style.opacity = '0';
        setTimeout(() => {
            this.tooltip.style.visibility = 'hidden';
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const tooltipElements = document.querySelectorAll('.tooltip-element');
    tooltipElements.forEach(element => new Tooltip(element));
});