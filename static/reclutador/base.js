// Base JavaScript for Reclutador Module
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize tooltips and other interactive elements
    initializeTooltips();
    
    // Initialize form validations
    initializeFormValidations();
    
    // Initialize table interactions
    initializeTableInteractions();
    
    // Initialize status badge animations
    initializeStatusBadges();

    // Inicializar selects de estado si existen
    initializeEstadoDropdowns();
});

function initializeTooltips() {
    // Add tooltip functionality to elements with data-tooltip attribute
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #1F2937;
                color: white;
                padding: 0.5rem 0.75rem;
                border-radius: 6px;
                font-size: 0.75rem;
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

function initializeFormValidations() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Add error message if not exists
                    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.textContent = 'Este campo es requerido';
                        errorMsg.style.cssText = `
                            color: #EF4444;
                            font-size: 0.75rem;
                            margin-top: 0.25rem;
                        `;
                        field.parentNode.insertBefore(errorMsg, field.nextSibling);
                    }
                } else {
                    field.classList.remove('error');
                    const errorMsg = field.parentNode.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
        
        // Remove error styling on input
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('error');
                const errorMsg = this.parentNode.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });
        });
    });
}

function initializeTableInteractions() {
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            row.addEventListener('click', function() {
                // Remove active class from all rows
                rows.forEach(r => r.classList.remove('active'));
                // Add active class to clicked row
                this.classList.add('active');
            });
        });
    });
}

function initializeStatusBadges() {
    const badges = document.querySelectorAll('.badge');
    
    badges.forEach(badge => {
        // Add subtle animation on hover
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

function initializeEstadoDropdowns() {
    const selects = document.querySelectorAll('.estado-select');
    selects.forEach(select => {
        // Guardar el valor inicial por si se cancela
        select.dataset.prev = select.value;
        select.addEventListener('change', function() {
            const self = this;
            const postulacionId = self.getAttribute('data-postulacion-id');
            const nuevoEstado = parseInt(self.value, 10);
            const prev = parseInt(self.dataset.prev, 10);

            const estadoMap = { 4: 'En Revisión', 5: 'Aceptado', 6: 'Rechazado' };
            const nombreEstado = estadoMap[nuevoEstado] || 'Desconocido';

            // Confirmación
            const mensaje = `¿Cambiar estado a "${nombreEstado}"?`;
            confirmAction(mensaje, () => {
                // Ejecutar actualización
                fetch(`/reclutador/postulaciones/${postulacionId}/cambiar-estado`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nuevo_estado: nuevoEstado })
                })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        showNotification(`Estado actualizado a "${nombreEstado}"`, 'success');
                        self.dataset.prev = String(nuevoEstado);
                    } else {
                        self.value = String(prev);
                        showNotification(`Error: ${data.message}`, 'error');
                    }
                })
                .catch(err => {
                    console.error(err);
                    self.value = String(prev);
                    showNotification('Error al cambiar el estado', 'error');
                });
            }, () => {
                // Cancelado: revertir select
                self.value = String(prev);
            });
        });
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function confirmAction(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 400px;
        width: 90%;
        text-align: center;
    `;

    // Título
    const title = document.createElement('h3');
    title.textContent = 'Confirmar Acción';
    title.style.cssText = 'margin-bottom: 1rem; color: #1F2937;';
    modalContent.appendChild(title);

    // Mensaje
    const msg = document.createElement('p');
    msg.textContent = message;
    msg.style.cssText = 'margin-bottom: 1.5rem; color: #6B7280;';
    modalContent.appendChild(msg);

    // Contenedor de botones
    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 1rem; justify-content: center;';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.onclick = () => {
        modal.remove();
        if (typeof onCancel === 'function') onCancel();
    };

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-danger';
    confirmBtn.textContent = 'Confirmar';
    confirmBtn.onclick = () => {
        modal.remove();
        if (typeof onConfirm === 'function') onConfirm();
    };

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    modalContent.appendChild(actions);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .table tr.active {
        background: #EBF8FF !important;
        border-left: 3px solid #3B82F6;
    }
    
    .form-input.error,
    .form-select.error,
    .form-textarea.error {
        border-color: #EF4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
`;
document.head.appendChild(style);

// Función para cambiar el estado de una postulación
function cambiarEstadoPostulacion(postulacionId, nuevoEstado) {
    // Mapear IDs de estado a nombres para mostrar
    const estadoMap = {
        4: 'En Revisión',
        5: 'Aceptado',
        6: 'Rechazado'
    };
    
    const nombreEstado = estadoMap[nuevoEstado];
    
    if (!nombreEstado) {
        showNotification('Estado no válido', 'error');
        return;
    }
    
    // Confirmar la acción
    const mensaje = `¿Estás seguro de que quieres cambiar el estado a "${nombreEstado}"?`;
    confirmAction(mensaje, () => {
        // Realizar la petición AJAX
        fetch(`/reclutador/postulaciones/${postulacionId}/cambiar-estado`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nuevo_estado: nuevoEstado
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(`Estado cambiado exitosamente a "${nombreEstado}"`, 'success');
                // Recargar la página para mostrar los cambios
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showNotification(`Error: ${data.message}`, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al cambiar el estado', 'error');
        });
    }, () => {
        // Si cancela, revertimos el select
        const selects = document.querySelectorAll(`.estado-select[data-postulacion-id="${postulacionId}"]`);
        selects.forEach(sel => {
            sel.value = String(Object.keys({4:4,5:5,6:6}).includes(String(sel.dataset.prev)) ? sel.dataset.prev : sel.value);
        });
    });
} 