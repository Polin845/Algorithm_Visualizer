class Renderer {

  render(step) {

    switch(step.type) {

      case "select_vertex":
        console.log("Выбрана вершина", step.vertex)
        break

      case "check_edge":
        console.log("Проверяем ребро", step.from, step.to)
        break

      case "relax_edge":
        console.log("Обновили расстояние", step.to)
        break

    case "init":
        console.log("Инициализация", step.vertex)
        break

    case "select_vertex":
        console.log("Выбрана вершина", step.vertex)
        break

    case "visit_vertex":
        console.log("Посещена вершина", step.vertex)
        break

    case "push_queue":
        console.log("Добавлена в очередь", step.vertex)
        break
    
    case "finish":
        console.log("Завершено", step.vertex)
        break
    }

  }

}