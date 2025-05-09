
function showHideLoader(show, hide) {
  show.style.display = 'block';
  hide.style.display = 'none'; 
}

function showError(error) {
   alert(error);
}

const login = async (email, password) => {
    try {
        
    } catch (error) {
        console.error(error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async (event) => {
    if (recuperar('token')) {
        window.location.href = '/';
    }
    
    const form = document.getElementById('formLogin');

    const loader = document.getElementById('loader');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = form.elements['email'].value;
        const password = form.elements['password'].value;

        showHideLoader(loader, form);

        try {
            
        } catch (error) {
            console.error(error);
        } finally {
            showHideLoader(form, loader);
        }
    })
});