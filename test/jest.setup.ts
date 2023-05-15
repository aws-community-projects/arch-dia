const now = Date.now();
jest.spyOn(Date, 'now').mockImplementation(() => now).mockReturnValue(42);
