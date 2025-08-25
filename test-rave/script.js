$(document).ready(function() {
    let userName = '';
    let userAge = 0;
    // Cargar los resultados desde localStorage o inicializar un array vacío
    let testResults = JSON.parse(localStorage.getItem('placaTestResults')) || [];

    var np = 60;
    var placa = 0;
    var results = '';
    var startTestTime = 0;
    
    const CORRECT_ANSWERS_KEY = "123456123456123456123456123456123456123456123456123456123456";

    function calculateRavenScores(correctCount, age) {
        let percentile = 0;
        let ci = 0;
        let group = "No definido";
        if (correctCount >= 55) {
            percentile = 95; ci = 130; group = "I";
        } else if (correctCount >= 50) {
            percentile = 90; ci = 120; group = "II";
        } else if (correctCount >= 40) {
            percentile = 75; ci = 110; group = "III+";
        } else if (correctCount >= 30) {
            percentile = 50; ci = 100; group = "III";
        } else if (correctCount >= 20) {
            percentile = 25; ci = 90; group = "III-";
        } else if (correctCount >= 10) {
            percentile = 10; ci = 80; group = "IV";
        } else {
            percentile = 5; ci = 70; group = "V";
        }
        return { percentile, ci, group };
    }

    function showSection(sectionId) {
        $('.active').removeClass('active').addClass('hidden');
        $(`#${sectionId}`).removeClass('hidden').addClass('active');
        if (sectionId === 'fill') {
            $('#fill').show();
            adjustFillHeight();
        } else {
            $('#fill').hide();
        }
    }

    function clearFormErrors() {
        $('.error').hide();
        $('#name').css({ border: "" });
        $('#age').css({ border: "" });
    }

    function validatePersonalForm() {
        let isValid = true;
        clearFormErrors();
        const nameInput = $('#name');
        const ageInput = $('#age');
        userName = nameInput.val().trim();
        userAge = parseInt(ageInput.val(), 10);
        if (userName === '') {
            $('#nameerr').show();
            nameInput.css({ border: "solid red 2px" });
            isValid = false;
        }
        if (isNaN(userAge) || userAge < 8) {
            $('#ageerr').show();
            ageInput.css({ border: "solid red 2px" });
            isValid = false;
        }
        return isValid;
    }

    function is_touch_device() {
        return 'ontouchstart' in window || navigator.maxTouchPoints;
    }

    function make_buttons() {
        $(".button, .button2").remove();
        const $currentPat = $("#pat" + placa);
        let scale = $currentPat.height() / 1098;
        if (($currentPat.width() / 1024) < scale) {
            scale = $currentPat.width() / 1024;
        }
        let leftOffset = ($currentPat.width() - 1024 * scale) / 2;
        let topOffset = ($currentPat.height() - 1098 * scale) / 2;
        let pos, cls;
        if (placa < 25) {
            pos = [[4, 675], [370, 675], [735, 675], [4, 919], [370, 919], [735, 919]];
            cls = "button";
        } else {
            pos = [[4, 688], [270, 688], [536, 688], [802, 688], [4, 930], [270, 930], [536, 930], [802, 930]];
            cls = "button2";
        }
        for (let i = 0; i < pos.length; i++) {
            const div = $(`<div class="${cls}" id="but${i + 1}" />`);
            div.width((cls === "button" ? 285 : 218) * scale);
            div.height((cls === "button" ? 175 : 150) * scale);
            div.css({ top: topOffset + pos[i][1] * scale, left: leftOffset + pos[i][0] * scale });
            div.on('click', function() {
                $(this).addClass("click");
                $(".button, .button2").not(".click").remove();
                $("#pat" + placa).css({ opacity: 0 }); 
                results += $(this).attr('id').substr(3); 
                setTimeout(next_pattern, 200); 
            });
            div.appendTo($currentPat);
        }
    }

    function next_pattern() {
        placa = (placa === 0) ? 1 : placa + 1;
        if (placa <= np) {
            $("#pat" + placa).css({ backgroundImage: `url('placas/${placa}.png')`, opacity: 1 });
        }
        $("#patterns").css({ left: (-100 * (placa - 1)) + '%' });
        $("#help").css({ color: "#b389f5" });
        if (placa > np) {
            const totalTimeMinutes = Math.round((Date.now() - startTestTime) / 1000 / 60);
            $("#help").html('<h1>¡Test completado!</h1><br />Calculando resultados...');
            $("#help").css({ color: '#fff' });
            $("#pat" + (np + 1)).css({ opacity: 1 });
            let correctAnswers = 0;
            for (let i = 0; i < results.length; i++) {
                if (i < CORRECT_ANSWERS_KEY.length && results[i] === CORRECT_ANSWERS_KEY[i]) {
                    correctAnswers++;
                }
            }
            const { percentile, ci, group } = calculateRavenScores(correctAnswers, userAge);
            
            // Guardamos el resultado como antes, pero no lo mostramos en la última diapositiva
            saveResult(userName, userAge, correctAnswers, percentile, ci, group);
            $("#pat" + (np + 1)).html(''); // Dejamos la última diapositiva en blanco

            // ===== INICIO DE LA MODIFICACIÓN =====
            // En lugar de mostrar la tabla de resultados, se muestra un mensaje final
            // y se redirige al inicio después de unos segundos.
            setTimeout(() => {
                // 1. Mostrar un mensaje final al usuario
                $('#help').html('<h1>¡Gracias por completar el test!</h1><br>Serás redirigido al inicio.');
                
                // 2. Esperar un momento para que el usuario lea el mensaje y luego reiniciar.
                setTimeout(() => {
                    showSection('personal');   // Volver a la pantalla de datos personales
                    clearFormErrors();         // Limpiar errores de validación si los hubo
                    $('#name, #age').val('');  // Limpiar los campos del formulario
                    
                    // Restaurar el mensaje de bienvenida original
                    $('#help').html('<h1>Bienvenido al Test de Raven</h1><br>').css({color: '#555'});
                }, 2500); // Esperar 2.5 segundos antes de volver al inicio

            }, 1000); // Esperar 1 segundo después de calcular resultados para mostrar el mensaje de "Gracias"
            // ===== FIN DE LA MODIFICACIÓN =====
            
            return;
        }
        setTimeout(make_buttons, 100);
        setTimeout(() => {
            const timeElapsedMinutes = Math.round((Date.now() - startTestTime) / 1000 / 60);
            const timeLeftMinutes = Math.max(0, 45 - timeElapsedMinutes);
            if (timeLeftMinutes <= 0 && placa <= np) {
                alert("¡Se acabó el tiempo! El test ha finalizado.");
                placa = np; 
                next_pattern(); 
                return;
            }
            const plateGroup = String.fromCharCode(Math.floor((placa - 1) / 12) + 'A'.charCodeAt(0));
            const plateNumberInGroup = ((placa - 1) % 12) + 1;
            $('#help').html(`<h1>Placa ${plateGroup}${plateNumberInGroup}</h1>Restan ${np - placa} placas<br />Tiempo restante: ${timeLeftMinutes} minutos`);
            $('#help').css({ color: '#fff' });
        }, 100);
    }

    function saveResult(name, age, correctAnswers, percentile, ci, group) {
        const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
        
        // Find if a result for this user already exists
        const existingResultIndex = testResults.findIndex(result => result.name === name && result.age === age);

        if (existingResultIndex !== -1) {
            // Update the existing entry
            testResults[existingResultIndex] = { name, age, correctAnswers, percentile, ci, group, date };
        } else {
            // Add a new entry
            testResults.push({ name, age, correctAnswers, percentile, ci, group, date });
        }
        localStorage.setItem('placaTestResults', JSON.stringify(testResults));
    }
    
    function displayResults() {
        const $resultsTableBody = $('#resultsTable tbody');
        $resultsTableBody.empty(); 
        if (testResults.length === 0) {
            $resultsTableBody.append('<tr><td colspan="8">No hay resultados anteriores.</td></tr>');
            return;
        }
        testResults.slice().reverse().forEach((result, index) => {
            const originalIndex = testResults.length - 1 - index;
            const row = `
                <tr>
                    <td>${result.name}</td>
                    <td>${result.age}</td>
                    <td>${result.correctAnswers}</td>
                    <td>${result.percentile}</td>
                    <td>${result.ci}</td>
                    <td>${result.group}</td>
                    <td>${result.date}</td>
                    <td>
                        <button class="delete-btn" data-index="${originalIndex}" style="padding: 5px 10px; background-color: #f0ad4e; color: white; border: none; border-radius: 3px; cursor: pointer;">Eliminar</button>
                    </td>
                </tr>
            `;
            $resultsTableBody.append(row);
        });
    }

    function exportToExcel() {
        if (testResults.length === 0) {
            alert("No hay resultados para exportar.");
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Nombre,Edad,Correctas,Percentil,CI,Grupo,Fecha\n";
        testResults.forEach(result => {
            let row = `${result.name},${result.age},${result.correctAnswers},${result.percentile},${result.ci},${result.group},${result.date}`;
            csvContent += row + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "resultados_test_raven.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Inicialización y manejadores de eventos
    if (is_touch_device()) {
        $("<style type='text/css'>").appendTo('head').html(".button:hover, .button2:hover {opacity: 0.0;}");
    }

    const adjustFillHeight = () => {
        const headerHeight = $('#header').outerHeight(true) || 0;
        const helpHeight = $('#help').outerHeight(true) || 0;
        const footerHeight = $('#footer').outerHeight(true) || 0;
        const mainPadding = parseFloat($('#main').css('padding-top')) + parseFloat($('#main').css('padding-bottom'));
        const totalNonFillHeight = headerHeight + helpHeight + footerHeight + mainPadding;
        let desiredHeight = $(window).height() - totalNonFillHeight - 2;
        $("#fill").css({ height: Math.max(desiredHeight, 300) });
    };

    for (let i = 1; i <= np; i++) {
        $("<div id='pat" + i + "' class='pat'/>").appendTo($("#patterns"));
    }
    $("<div id='pat" + (np + 1) + "' class='pat'/>").html("Calculando resultados...").appendTo($("#patterns"));

    adjustFillHeight();
    $(window).resize(function() {
        adjustFillHeight();
        if (placa > 0 && placa <= np) setTimeout(make_buttons, 100);
    });

    $('#startTestFormBtn').on('click', () => { if (validatePersonalForm()) showSection('info'); });
    $('#startTestInfoBtn').on('click', () => {
        startTestTime = Date.now();
        results = '';
        placa = 0;
        $("#patterns").css({left: '0%'});
        $('.pat').css({opacity: 0});
        showSection('fill');
        next_pattern();
    });

    $('#viewResultsBtn').on('click', function() {
        const inputUser = prompt("Para ver los resultados, ingrese el usuario:");
        if (inputUser === null) return;
        const inputPass = prompt("Ingrese la contraseña:");
        if (inputPass === null) return;
        if (inputUser === 'admin' && inputPass === 'admin123') {
            displayResults();
            showSection('resultsContainer');
        } else {
            alert("Usuario o contraseña incorrectos. Acceso denegado.");
        }
    });

    $('#backToFormBtn').on('click', () => {
        showSection('personal');
        clearFormErrors();
        $('#name, #age').val('');
        $('#help').html('<h1>Bienvenido al Test de Raven</h1><br>').css({color: '#555'});
    });
    
    $('#exportExcelBtn').on('click', exportToExcel);
    
    $('#resultsTable tbody').on('click', '.delete-btn', function() {
        const indexToDelete = $(this).data('index'); 
        
        if (confirm(`¿Está seguro de que desea eliminar el registro de ${testResults[indexToDelete].name}?`)) {
            testResults.splice(indexToDelete, 1); 
            localStorage.setItem('placaTestResults', JSON.stringify(testResults));
            displayResults(); 
        }
    });

    $('#clearAllResultsBtn').on('click', function() {
        if (confirm('¿ESTÁ COMPLETAMENTE SEGURO de que desea eliminar TODOS los resultados? Esta acción no se puede deshacer.')) {
            testResults = []; 
            localStorage.removeItem('placaTestResults');
            displayResults(); 
            alert('Todos los resultados han sido eliminados.');
        }
    });
});