// Situaciones para conversar con el tutor. Las comparten el servidor (instrucciones) y la pantalla (tarjetas).

export type TutorScenario = {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Lo que el tutor debe saber de la situación (en inglés, para el modelo). */
  brief: string;
};

export const TUTOR_SCENARIOS: readonly TutorScenario[] = [
  {
    id: "free",
    title: "Charla libre",
    description: "Habla de lo que quieras: tu día, tu familia, tus gustos.",
    icon: "💬",
    brief: "A relaxed friendly chat. Ask about the student's day, family, community, likes and routine.",
  },
  {
    id: "meet",
    title: "Conocer a alguien",
    description: "Te presentas: tu nombre, de dónde eres y a qué te dedicas.",
    icon: "🤝",
    brief: "You meet the student for the first time at a community event. Exchange names, where you are from, and what you do.",
  },
  {
    id: "church",
    title: "Después de misa",
    description: "Un visitante de otro país te saluda al salir de la iglesia.",
    icon: "⛪",
    brief:
      "You are a tourist visiting the student's church after Mass. Greet him, say the church is beautiful, ask simple questions about the church, the town and the times of Mass.",
  },
  {
    id: "restaurant",
    title: "En el restaurante",
    description: "Pides la comida, preguntas el precio y pides la cuenta.",
    icon: "🍽️",
    brief:
      "You are a waitress in a small restaurant. Greet the student, offer a table, take the order (food and drinks), and at the end give the check with a simple price in dollars.",
  },
  {
    id: "directions",
    title: "Pedir indicaciones",
    description: "Estás en una ciudad nueva y preguntas cómo llegar.",
    icon: "🗺️",
    brief:
      "You are a local person in a new city. The student asks where places are (pharmacy, bank, bus station, park). Give very simple directions: go straight, turn left, turn right, it is near/far.",
  },
];

export function getScenario(id: string): TutorScenario | undefined {
  return TUTOR_SCENARIOS.find((s) => s.id === id);
}
