export default function formatCurrency(number) {
  return "₹" + Number(number).toLocaleString("en-IN");
}
