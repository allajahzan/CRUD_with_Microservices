import NavbarComponent from "../../../components/navbar/admin/navbar_admin"
import deleteIcon from '../../../assets/delete.svg'
import edit from '../../../assets/edit.svg'
import addUser from '../../../assets/user.svg'
import { Table } from "flowbite-react"
import { useDispatch, useSelector } from "react-redux"
import { useContext, useLayoutEffect, useState } from "react"
import { AdminAuth } from "../../../auth/adminAuth"
import { SetAdminToken } from "../../../redux/store"
import Cookies from "js-cookie"
import { AdminContext } from "../../../context/adminContext"
import { Link, useNavigate } from "react-router-dom"
import pic from '../../../assets/pic1.jpg'
import loading from '../../../assets/loading.svg'

function Users() {

    const accessToken = useSelector((state: any) => state.adminToken)
    const dispathFun = useDispatch()

    const adminContext = useContext(AdminContext)
    const navigate = useNavigate()

    const [users, setUsers] = useState<object[] | null>(null)

    const handleDelete = (userId: string) => {
        AdminAuth(accessToken)
            .then((newAccessToken) => {
                if (newAccessToken) {
                    dispathFun(SetAdminToken(newAccessToken))
                    Cookies.set('adminAccessToken', newAccessToken)

                    fetch(`${import.meta.env.VITE_SERVICE_BASE_URL}/admin/deleteUser/${userId}`,
                        {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${newAccessToken}`
                            }
                        })
                        .then(async (res) => {
                            const data = await res.json()
                            if (res.ok) {
                                const newUsers = (users as object[]).filter((user) => (user as any).userId !== userId)
                                setUsers(newUsers)
                            } else {
                                if (res.status === 403) {
                                    handleDelete(userId)
                                } else if (res.status === 404) {
                                    alert('Require login')
                                    adminContext?.logout()
                                } else if (res.status === 410) {
                                    alert(data.msg)
                                } else {
                                    alert('We are experiencing server issues. Please try again shortly');
                                }
                            }
                        })
                        .catch((_err) => {
                            alert('We are experiencing server issues. Please try again shortly');
                        })
                } else if (newAccessToken === undefined) {
                    alert('We are experiencing server issues. Please try again shortly');
                    adminContext?.logout()
                } else {
                    adminContext?.logout()
                }
            })
    }

    useLayoutEffect(() => {
        const getUsers = () => {
            AdminAuth(accessToken)
                .then((newAccessToken) => {
                    if (newAccessToken) {
                        dispathFun(SetAdminToken(newAccessToken))
                        Cookies.set('adminAccessToken', newAccessToken)

                        fetch(`${import.meta.env.VITE_SERVICE_BASE_URL}/admin/getUsers`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${newAccessToken}`
                            }
                        })
                            .then(async (res) => {
                                const data = await res.json()
                                if (res.ok) {
                                    setUsers(data.users)
                                } else {
                                    if (res.status === 403) {
                                        getUsers()
                                    } else if (res.status === 404) {
                                        console.log("Require login")
                                        adminContext?.logout()
                                    }
                                    else {
                                        alert('We are experiencing server issues. Please try again shortly');
                                    }
                                }
                            })
                            .catch((_err) => {
                                alert('We are experiencing server issues. Please try again shortly');
                            })
                    } else if (newAccessToken === undefined) {
                        alert('We are experiencing server issues. Please try again shortly');
                        adminContext?.logout()
                    } else {
                        adminContext?.logout()
                    }
                })
        }

        getUsers()
    }, [])


    const handleAddUser = () => {
        navigate('/admin/addUser')
    }

    return (
        <div style={{
            backgroundImage: `url(${pic})`,
            backgroundSize: 'cover'
        }} className="h-screen w-full bg-white flex items-center justify-center">

            <NavbarComponent />

            <div className="flex flex-col justify-center absolute z-0 top-12 w-full p-10 px-5 sm:px-14 md:px-16">
                {/* <div className="w-full relative overflow-hidden"> */}
                <div className="flex justify-end mb-5">
                    <div onClick={handleAddUser} className="bg-white rounded-full cursor-pointer">
                        <img className="w-11 p-2" src={addUser} alt="" />
                    </div>
                </div>
                <div className="overflow-y-hidden overflow-x-auto w-full">
                    {users && users.length > 0 && <Table theme={
                        {
                            "root": {
                                "base": "w-full text-left text-sm text-gray-500 dark:text-gray-400",
                                "shadow": "absolute left-0 top-0 -z-10 h-full w-full drop-shadow-md dark:bg-transparent",
                                "wrapper": "relative"
                            },
                            "body": {
                                "base": "group/body",
                                "cell": {
                                    "base": "px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg "
                                }
                            },
                            "head": {
                                "base": "group/head text-sm text-black",
                                "cell": {
                                    "base": " px-6 py-3 bg-white"
                                }
                            },
                            "row": {
                                "base": "group/row",
                                "hovered": "hover:bg-gray-50 dark:hover:bg-gray-600",
                                "striped": "odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-700"
                            }
                        }
                    } className="w-full">
                        <Table.Head className="">
                            <Table.HeadCell className="font-medium text-base ">No</Table.HeadCell>
                            <Table.HeadCell className="font-medium text-base ">Name</Table.HeadCell>
                            <Table.HeadCell className="font-medium text-base ">Email</Table.HeadCell>
                            <Table.HeadCell>
                                <p></p>
                            </Table.HeadCell>
                            <Table.HeadCell>
                                <p></p>
                            </Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-">
                            {users?.map((item: any, index: number) => {
                                return <Table.Row key={index} className="bg-black bg-opacity-50 border-b-2 border-opacity-30 border-white">
                                    <Table.Cell className="whitespace-nowrap font-medium text-white text-base">
                                        {index + 1}
                                    </Table.Cell>
                                    <Table.Cell className="whitespace-nowrap font-medium text-white text-base ">
                                        {item.name}
                                    </Table.Cell>
                                    <Table.Cell className="whitespace-nowrap font-medium text-white text-base ">
                                        {item.email}
                                    </Table.Cell>
                                    <Table.Cell className="p-0">
                                        <Link to={`/admin/edit/${item.name.replace(/\s+/g, '')}`} state={item}>
                                            <img className="w-6 cursor-pointer" src={edit} alt="" />
                                        </Link>
                                    </Table.Cell>
                                    <Table.Cell className="p-0">
                                        <img className="w-6 cursor-pointer" onClick={() => handleDelete(item.userId)} src={deleteIcon} alt="" />
                                    </Table.Cell>
                                </Table.Row>
                            })}
                        </Table.Body>
                    </Table>
                    }
                    {/* </div> */}
                </div>
            </div>

            {users && users.length == 0 &&
                <div className="flex justify-center items-centerp-10">
                    <p className="text-white font-medium text-lg">No users found!</p>
                </div>
            }

            {!users &&
                <div className="flex justify-center items-center ">
                    <img className="w-10 animate-spin" src={loading} alt="" />
                </div>
            }

        </div>


    )
}

export default Users
