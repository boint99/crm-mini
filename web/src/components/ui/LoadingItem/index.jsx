import { LoaderCircle } from "lucide-react"

const LoadingItem = () => {
    return (
        <div className="flex justify-center items-center h-40">
            <LoaderCircle className="animate-spin w-8 h-8 text-gray-500" />
        </div>
    )
}
export default LoadingItem