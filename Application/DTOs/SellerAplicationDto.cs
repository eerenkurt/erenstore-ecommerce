using System;

namespace Application.DTOs;

public class SellerApplicationDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string StoreName { get; set; } = string.Empty;
    public string SellerStatus { get; set; } = string.Empty; 
    public DateTime CreatedDate { get; set; }
}