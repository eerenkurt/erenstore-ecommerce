using Entities.Enums;

namespace Application.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; } 
        public DateTime CreatedDate { get; set; }
        
        public List<OrderItemDto> OrderItems { get; set; } 
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } 
        public int Quantity { get; set; }
        public decimal Price { get; set; } 
    }
}