namespace Application.DTOs;

public class SellerApplicationDto
{
    public int UserId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; 
}