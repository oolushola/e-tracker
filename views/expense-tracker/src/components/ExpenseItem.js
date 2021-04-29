import './ExpenseItem.css'

const ExpenseItem = () => {
  return (
    <div className="expenseItem">
      <div className="expenseDate">
        <div className="expenseDate__month">September</div>
        <div className="expenseDate__day">25</div>
        <div className="expenseDate__year">2021</div>
      </div>
      <div className="expenseItem__description">
        <h2>Expense Title</h2>
        <div>Price</div>
      </div>
    </div>
  )
}

export default ExpenseItem