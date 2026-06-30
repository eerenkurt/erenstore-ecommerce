using System.Linq.Expressions;
using Entities.Models;

namespace Application.Interfaces;

public interface IRepository<T> where T : BaseModel
{
    Task<T?> GetByIdAsync(int id, params string[] includes);
    Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? predicate = null, params string[] includes);
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
    Task<int> SaveChangesAsync();
}