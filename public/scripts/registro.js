
function showHideLoader(show, hide) {
  show.style.display = 'block';
  hide.style.display = 'none'; 
}

function showError(error) {
   alert(error);
}

const registrarse = async (nombre, email, password) => {
    try{
        const uri = '/api/auth/registro';

        const response = await fetch(uri, {
            headers: {
                "Content-Type" : "application/json"
            },
            method: 'POST',
            body: JSON.stringify({nombre, email, password})
        });
        if (response.status === 201) {
            return true;
        } else {
            return false;
        }
    }catch(error) {

    }
}

document.addEventListener('DOMContentLoaded', (event) => {

    const form = document.getElementById("formRegistro");
    const loader = document.getElementById('loader');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nombre = form.elements["nombre"].value;
        const email = form.elements["email"].value;
        const password = form.elements["password"].value;

        showHideLoader(loader, form);
        
        try {
            
            
        } catch (error) {
            console.error(error);   
        } finally {
            showHideLoader(form, loader);
        }

    }); 
});