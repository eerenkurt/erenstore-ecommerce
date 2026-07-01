namespace Entities.Models;

public class CartItem : BaseModel
{
    public int CustomerId { get; set; }
    public User Customer { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }
}