
/*
  CONFIGURAÇÃO DA BARBEARIA
  Troque pelo WhatsApp real do cliente.
  Use DDI + DDD + número, somente números.
  Exemplo de formato: 5555991234567
*/
const WHATSAPP_NUMBER = "5555999999999";

// Horário de atendimento: segunda a sábado, 09h às 19h.
const OPEN_HOUR = 9;
const CLOSE_HOUR = 19;
const SLOT_MINUTES = 30;

const form = document.getElementById("bookingForm");
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");
const serviceSelect = document.getElementById("service");
const result = document.getElementById("bookingResult");

document.getElementById("year").textContent =
  new Date().getFullYear();

// Menu para celular
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Fechar menu" : "Abrir menu"
  );
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Impede selecionar datas passadas
function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

dateInput.min = localDateString(new Date());

function generateTimes() {
  timeSelect.innerHTML = "";

  const selectedDate = dateInput.value;

  if (!selectedDate) {
    timeSelect.add(new Option("Selecione a data primeiro", ""));
    return;
  }

  // Interpreta a data como uma data local, evitando problemas de fuso.
  const [year, month, day] = selectedDate.split("-").map(Number);
  const chosenDate = new Date(year, month - 1, day);
  const today = new Date();

  if (chosenDate.getDay() === 0) {
    timeSelect.add(new Option("Fechado aos domingos", ""));
    return;
  }

  timeSelect.add(new Option("Selecione um horário", ""));

  let availableCount = 0;

  for (
    let minutes = OPEN_HOUR * 60;
    minutes < CLOSE_HOUR * 60;
    minutes += SLOT_MINUTES
  ) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    // Não oferece horários anteriores ao momento atual.
    const slotDate = new Date(
      year, month - 1, day, hour, minute
    );

    if (slotDate <= today) continue;

    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    timeSelect.add(new Option(time, time));
    availableCount++;
  }

  if (availableCount === 0) {
    timeSelect.innerHTML = "";
    timeSelect.add(new Option("Não há horários disponíveis nesta data", ""));
  }
}

dateInput.addEventListener("change", generateTimes);

// Botões de serviço levam para o formulário com o serviço selecionado.
document.querySelectorAll(".service-book").forEach(button => {
  button.addEventListener("click", () => {
    serviceSelect.value = button.dataset.service;
    document.getElementById("agendamento").scrollIntoView({
      behavior: "smooth"
    });
  });
});

function getBookingData() {
  return {
    name: document.getElementById("clientName").value.trim(),
    phone: document.getElementById("clientPhone").value.trim(),
    service: serviceSelect.value,
    barber: document.getElementById("barber").value,
    date: dateInput.value,
    time: timeSelect.value,
    notes: document.getElementById("notes").value.trim()
  };
}

function validateBooking(data) {
  if (!form.reportValidity()) return false;

  if (!data.time) {
    alert("Selecione uma data e um horário válido.");
    return false;
  }

  if (data.date < localDateString(new Date())) {
    alert("Escolha uma data futura.");
    return false;
  }

  return true;
}

function buildMessage(data) {
  return [
    "Olá! Gostaria de solicitar um agendamento.",
    "",
    `Nome: ${data.name}`,
    `Telefone: ${data.phone}`,
    `Serviço: ${data.service}`,
    `Barbeiro: ${data.barber}`,
    `Data: ${data.date.split("-").reverse().join("/")}`,
    `Horário: ${data.time}`,
    data.notes ? `Observações: ${data.notes}` : "",
    "",
    "Poderiam confirmar a disponibilidade, por favor?"
  ].filter(Boolean).join("\n");
}

function openWhatsApp(data) {
  if (WHATSAPP_NUMBER === "5555999999999") {
    alert(
      "Configure o número real da barbearia na variável WHATSAPP_NUMBER do arquivo script.js."
    );
    return;
  }

  const url =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(data))}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

// Solicitação pelo site
form.addEventListener("submit", event => {
  event.preventDefault();

  const data = getBookingData();
  if (!validateBooking(data)) return;

  result.hidden = false;
  result.innerHTML = `
    <strong>Solicitação preparada!</strong><br>
    Serviço: ${escapeHTML(data.service)}<br>
    Data: ${escapeHTML(data.date.split("-").reverse().join("/"))}<br>
    Horário: ${escapeHTML(data.time)}<br><br>
    Para enviar a solicitação à barbearia, use o botão
    "Agendar pelo WhatsApp". Seu horário ainda precisa ser confirmado.
  `;

  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// Agendamento via WhatsApp
document.getElementById("whatsappButton").addEventListener("click", () => {
  const data = getBookingData();

  if (!validateBooking(data)) return;

  openWhatsApp(data);
});

// Atalho flutuante do WhatsApp
document.getElementById("floatingWhatsApp").addEventListener("click", event => {
  event.preventDefault();

  if (WHATSAPP_NUMBER === "5555999999999") {
    alert(
      "Configure o WhatsApp real no arquivo script.js antes de publicar."
    );
    return;
  }

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}`,
    "_blank",
    "noopener,noreferrer"
  );
});

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}
