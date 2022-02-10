import { useContext, useEffect } from "react"
import { UserCan } from "../components/userCan";
import { AuthContext } from "../context/AuthContext"
import { useUserCan } from "../hooks/useUserCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user } = useContext(AuthContext)

  const userCanSeeMetrics = useUserCan({
    permissions: ['metrics.list']
  })

  useEffect(() => {
    api.get('/me').then(response => console.log('Browser response', response))

  }, [])
  
  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <UserCan permissions={['metrics.list']} >
        <div>Métricas</div>
      </UserCan>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  const response = await apiClient.get('/me')
  console.log('SSR response', response.data);

  return {
    props: {}
  }
})