import { useSearchParams } from 'react-router-dom'
import { parseTop3Params } from '../utils/url-params'
import Top3Content from '../components/Top3Content'

function Top3Page() {
  const [searchParams] = useSearchParams()
  const params = parseTop3Params(searchParams)

  return <Top3Content params={params} />
}

export default Top3Page
