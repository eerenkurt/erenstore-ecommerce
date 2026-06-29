using Entities.Enums;

namespace Entities.Models;

public class User : BaseModel
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;    
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    
    public UserTypes UserType { get; set; }
    
    public string? StoreName { get; set; }
    public SellerStatus? SellerStatus { get; set; }
}