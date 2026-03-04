document.addEventListener("DOMContentLoaded", function () {

    const buttons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".gallery-card");
  
    buttons.forEach(button => {
      button.addEventListener("click", () => {
  
        document.querySelector(".filter-btn.active").classList.remove("active");
        button.classList.add("active");
  
        const filter = button.getAttribute("data-filter");
  
        cards.forEach(card => {
          if (filter === "all" || card.dataset.category === filter) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });
  
      });
    });
  
  });