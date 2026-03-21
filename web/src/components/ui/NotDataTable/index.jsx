const NotDataTable = () => {
    return (
        <tbody>
            <tr>
                <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v6M13 21h8M16 18v6M19 18v6" />
                        </svg>
                        <p className="text-sm font-medium">Không có dữ liệu</p>
                    </div>
                </td>
            </tr>
        </tbody>
    )

}
export default NotDataTable